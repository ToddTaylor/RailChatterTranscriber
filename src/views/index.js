import { containsDirection, containsDetector, capitalizeFirstLetter, getTime, replaceNonAlphNumericCharacters, replaceWords } from '../string-utils.js';

let recognition = null;
let finalTranscript = '';
let finalHotboxTranscript = '';
let speechListenerStopped = false;
let hotboxTranscriptsDictionary = [];
let captionCounter = 0;
let hotboxCaptionCounter = 0;
let maxCaptions = 200;
let maxHotboxCaptions = 100;
let networkConnectionRetryCount = 0;

let directionIconDictionary = [
    { keyWord: "north", icon: "<i class='fa-solid fa-arrow-up fa-sm' title='Northbound'></i>" },
    { keyWord: "south", icon: "<i class='fa-solid fa-arrow-down fa-sm' title='Southbound'></i>" },
    { keyWord: "east", icon: "<i class='fa-solid fa-arrow-right fa-sm' title='Eastbound'></i>" },
    { keyWord: "west", icon: "<i class='fa-solid fa-arrow-left fa-sm' title='Westbound'></i>" }
];

let detectorDictionary = [
    { milepost: "94.0", railroad: "cn", location: "Waukesha" },
    { milepost: "108.8", railroad: "cn", location: "Sussex" },
    { milepost: "123.14", railroad: "cn", location: "Slinger" }
];

window.onload = function onload() {
    const btnStartListening = document.getElementById('btnStartListening');
    const btnStopListening = document.getElementById('btnStopListening');
    const spanMaxCaptionCount = document.getElementById('spanMaxCaptionCount');
    const spanMaxHotboxCaptionCount = document.getElementById('spanMaxHotboxCaptionCount');
    const iconWalkieTalkie = document.getElementById('iconWalkieTalkie');

    if (!btnStartListening || !btnStopListening || !spanMaxCaptionCount || !spanMaxHotboxCaptionCount || !iconWalkieTalkie) {
        console.error("One or more required DOM elements are missing.");
        return;
    }

    btnStartListening.addEventListener('click', function (e) {
        speechListenerStopped = false;
        startSpeechAPI();
    });

    btnStopListening.addEventListener('click', function (e) {
        speechListenerStopped = true;
        stopSpeechAPI();
    });

    spanMaxCaptionCount.innerHTML = maxCaptions;
    spanMaxHotboxCaptionCount.innerHTML = maxHotboxCaptions;

    setupSpeechAPI();
}

function detectorLocation(transcript) {
    if (!transcript) return '';

    for (let i = 0; i < detectorDictionary.length; i++) {
        if (transcript.toLowerCase().includes(detectorDictionary[i].milepost)) {
            return '(' + detectorDictionary[i].location + ') ';
        }
    }

    return '';
}

/**
 * Replace the icon based on the keyword in the transcript.
 * @param {*} transcript Current transcript to be processed.
 * @returns  Returns the icon based on the keyword in the transcript.
 */
function directionIcon(transcript) {
    if (!transcript) return '';

    for (let i = 0; i < directionIconDictionary.length; i++) {
        if (transcript.toLowerCase().includes(directionIconDictionary[i].keyWord)) {
            return directionIconDictionary[i].icon;
        }
    }

    return '';
}

function startSpeechAPI() {
    if (typeof recognition !== 'undefined' && recognition !== null) {
        recognition.stop();
        recognition.start();
    } else {
        setupSpeechAPI();
    }

    const btnStartListening = document.getElementById('btnStartListening');
    const btnStopListening = document.getElementById('btnStopListening');
    const iconWalkieTalkie = document.getElementById('iconWalkieTalkie');

    if (btnStartListening) btnStartListening.disabled = true;
    if (btnStopListening) btnStopListening.disabled = false;
    if (iconWalkieTalkie) {
        iconWalkieTalkie.className = 'fa-solid fa-walkie-talkie fa-2xl';
        iconWalkieTalkie.style.color = '#00ff37';
    }

    return;
}

function stopSpeechAPI() {
    const btnStartListening = document.getElementById('btnStartListening');
    const btnStopListening = document.getElementById('btnStopListening');
    const iconWalkieTalkie = document.getElementById('iconWalkieTalkie');

    if (recognition !== null) {
        recognition.stop();
    }

    if (btnStartListening) btnStartListening.disabled = false;
    if (btnStopListening) btnStopListening.disabled = true;

    if (iconWalkieTalkie) {
        iconWalkieTalkie.className = 'fa-solid fa-walkie-talkie fa-2xl';
        iconWalkieTalkie.style.color = '#ff0000';
    }

    return;
}

function setupSpeechAPI() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    const divCaptions = document.getElementById('divCaptions');
    const divHotboxCaptions = document.getElementById('divHotboxCaptions');

    if (!divCaptions || !divHotboxCaptions) {
        console.error("Required DOM elements for captions are missing.");
        return;
    }

    if (SpeechRecognition) {
        recognition = new SpeechRecognition();
        recognition.lang = 'en-US';
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.maxAlternatives = 10;

        recognition.onresult = function (event) {

            let interimTranscript = '';

            for (let i = event.resultIndex; i < event.results.length; i++) {
                let transcript = sanitizeHTML(event.results[i][0].transcript);

                if (transcript.trim().length === 0) {
                    continue;
                }

                if (event.results[i].isFinal) {
                    // Transcript is "cloned" before passing into detector function.  See https://stackoverflow.com/a/59293003/4297541
                    finalHotboxTranscript = processDetectorCaption(`${transcript}`) + finalHotboxTranscript;
                    finalTranscript = '<div id=\'divCaption' + captionCounter + '\'>' + spanTimestamp() + signalSourceIconChooser(transcript) + ' ' + transcript + '</div>' + finalTranscript;
                } else {
                    interimTranscript += transcript;
                }
            }

            if (interimTranscript) {
                divCaptions.innerHTML = '<div><i style=\'color:#999999;\'>' + interimTranscript + '</i>' + finalTranscript;
            } else {
                divCaptions.innerHTML = finalTranscript;
                divHotboxCaptions.innerHTML = finalHotboxTranscript;
                captionCounter++;
            }

            // Trim the number of captions to prevent the page from becoming too large.
            if (captionCounter > maxCaptions) {
                const divCaptionBeforeTrimmedCaptions = document.getElementById(`divCaption${captionCounter - maxCaptions}`);
                if (divCaptionBeforeTrimmedCaptions) {
                    let nextSibling = divCaptionBeforeTrimmedCaptions.nextElementSibling;
                    while (nextSibling) {
                        const toRemove = nextSibling;
                        nextSibling = nextSibling.nextElementSibling;
                        toRemove.remove();
                    }
                }
            }

            if (hotboxCaptionCounter > maxHotboxCaptions) {
                const divCaptionBeforeTrimmedCaptions = document.getElementById(`divHotboxCaption${hotboxCaptionCounter - maxHotboxCaptions}`);
                if (divCaptionBeforeTrimmedCaptions) {
                    let nextSibling = divCaptionBeforeTrimmedCaptions.nextElementSibling;
                    while (nextSibling) {
                        const toRemove = nextSibling;
                        nextSibling = nextSibling.nextElementSibling;
                        toRemove.remove();
                    }
                }
            }
        };

        recognition.onstart = function () {
            const btnStartListening = document.getElementById('btnStartListening');
            const btnStopListening = document.getElementById('btnStopListening');

            if (btnStartListening) btnStartListening.disabled = true;
            if (btnStopListening) btnStopListening.disabled = false;
        }

        // Automatically restart the recognition process after it ends (to prevent timeouts)
        recognition.onend = function () {
            if (!speechListenerStopped && networkConnectionRetryCount < 3) { // If the 'stop listening' button was not explicitly pressed, start listening again.
                startSpeechAPI();
            } else {
                console.warn("Speech recognition stopped after multiple retries.");
            }
        };

        recognition.onabort = () => {
            console.log('Speech recognition was aborted.');
        };

        recognition.onerror = (event) => {
            let error = spanErrorIcon();

            // Add specific error handling based on the error code
            if (event.error === 'no-speech') {
                //error += 'No speech detected, please try again.<br/>';
                // Don't stop just because no speech was detected.
                return;
            } else if (event.error === 'audio-capture') {
                error += ' Audio capture failed, please check your microphone.';
            } else if (event.error === 'not-allowed') {
                error += ' Speech recognition was not allowed by the user.';
            } else if (event.error === 'network') {
                if (networkConnectionRetryCount < 3) {
                    stopSpeechAPI();
                    error += ' Network error occurred. Retrying...';
                    divCaptions.innerHTML = error;
                    networkConnectionRetryCount++;
                    startSpeechAPI();
                    return;
                } else {
                    error += ' Unrecoverable network error occurred while trying to access the speech service.';
                    networkConnectionRetryCount = 0;
                }
            } else {
                error += 'An unknown error occurred: ' + event.error;
            }

            divCaptions.innerHTML = '<div>' + error + '</div>' + finalTranscript;
            speechListenerStopped = true;
            stopSpeechAPI();
        };

        recognition.start();
    }
    else {
        divCaptions.innerHTML = 'Speech recognition is not supported by this browser.';
    }

    return;
}

function sanitizeHTML(input) {
    const tempDiv = document.createElement('div');
    tempDiv.textContent = input;
    return tempDiv.innerHTML;
}

function processDetectorCaption(hotboxTranscript) {

    hotboxTranscript = replaceWords(hotboxTranscript);
    hotboxTranscript = replaceNonAlphNumericCharacters(hotboxTranscript);

    let transcriptContainsDetector = containsDetector(hotboxTranscript);
    let transcriptContainsDirection = containsDirection(hotboxTranscript);

    if (!transcriptContainsDetector && !transcriptContainsDirection) {
        return '';
    }

    // Determine the key for the dictionary entry based on what is found in the transcript.
    let key = '';
    if (transcriptContainsDetector && transcriptContainsDirection) {
        key = 'both';
    } else if (transcriptContainsDetector) {
        key = 'detector';
    } else if (transcriptContainsDirection) {
        // If there's a direction but no detector, check if the dictionary contains "detector" already.
        let detectorFound = hotboxTranscriptsDictionary.some(item => item.key === 'detector');
        if (!detectorFound) return '';
        key = 'direction';
    }

    // If a key is set, push the corresponding entry to the dictionary.
    if (key) {
        hotboxTranscriptsDictionary.push({ key, value: hotboxTranscript });
    }

    // Search for the necessary dictionary entries.
    let bothFound = hotboxTranscriptsDictionary.some(item => item.key === 'both');
    let detectorFound = hotboxTranscriptsDictionary.some(item => item.key === 'detector');
    let directionFound = hotboxTranscriptsDictionary.some(item => item.key === 'direction');

    let bothTranscript = '';

    if (bothFound) {
        let bothTranscriptObject = hotboxTranscriptsDictionary.find(item => item.key === 'both');
        bothTranscript = capitalizeFirstLetter(bothTranscriptObject.value);
    } else if (detectorFound && directionFound) {
        let detectorTranscriptObject = hotboxTranscriptsDictionary.find(item => item.key === 'detector');
        let directionTranscriptObject = hotboxTranscriptsDictionary.find(item => item.key === 'direction');

        let detectorTranscript = capitalizeFirstLetter(detectorTranscriptObject.value);
        let directionTranscript = capitalizeFirstLetter(directionTranscriptObject.value);

        bothTranscript = `${detectorTranscript} ${directionTranscript}`;
    }

    if (bothTranscript) {

        bothTranscript = detectorLocation(bothTranscript) + bothTranscript;

        let isEndOfTrainTranscript = bothTranscript.toLocaleLowerCase().includes('temperature') || bothTranscript.includes('axles') || bothTranscript.includes('defects') || bothTranscript.includes('speed')
        if (isEndOfTrainTranscript) {
            bothTranscript = '<span style=\'color:#999999;\'>' + bothTranscript + '</spon>';
        }

        let baseHotboxCaption = spanTowerBroadCastIcon() + directionIcon(bothTranscript) + ' ' + bothTranscript;
        let hotboxTranscriptHTML = `<div id='divHotboxCaption${hotboxCaptionCounter}'>${baseHotboxCaption}</div>`;

        hotboxCaptionCounter++;
        hotboxTranscriptsDictionary = [];

        return hotboxTranscriptHTML.trim();
    }

    // If queue has more than 5 items and no valid captions, clear the queue.
    if (hotboxTranscriptsDictionary.length > 5) {
        hotboxTranscriptsDictionary = [];
    }

    return '';
}

function spanErrorIcon() {
    return spanTimestamp() + ' <i class=\'fa-solid fa-circle-exclamation fa-sm\' title=\'Error\'></i>';
}

function spanTowerBroadCastIcon() {
    return spanTimestamp() + ' <i class=\'fa-solid fa-tower-broadcast fa-sm\' title=\'Hot Box Detector\'></i>';
}

function spanTimestamp() {
    return '<span style=\'color:#999999;\'>' + getTime() + '</span> ';
}

function signalSourceIconChooser(transcript) {
    if (transcript.toLowerCase().includes('detector')) {
        return '<i class=\'fa-solid fa-tower-broadcast fa-sm\' title=\'Hot Box Detector\'></i>';
    }

    return '<i class=\'fa-solid fa-walkie-talkie fa-sm\' title=\'Walkie-Talkie\'></i>';
}

export { processDetectorCaption };