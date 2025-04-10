import { containsDirection, containsDetector, capitalizeFirstLetter, isDetectorTranscript, getTime, replaceNonAlphNumericCharacters, replaceWords } from './string-utils.js';

let recognition = null;
let finalTranscript = '';
let finalHotboxTranscript = '';
let speechListenerStopped = false;
let hotboxTranscriptsDictionary = [];
let TranscriptCounter = 0;
let hotboxTranscriptCounter = 0;
let maxTranscripts = 200;
let maxHotboxTranscripts = 100;
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
    const spanMaxTranscriptCount = document.getElementById('spanMaxTranscriptCount');
    const spanMaxHotboxTranscriptCount = document.getElementById('spanMaxHotboxTranscriptCount');
    const iconWalkieTalkie = document.getElementById('iconWalkieTalkie');

    if (!btnStartListening || !btnStopListening || !spanMaxTranscriptCount || !spanMaxHotboxTranscriptCount || !iconWalkieTalkie) {
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

    spanMaxTranscriptCount.innerHTML = maxTranscripts;
    spanMaxHotboxTranscriptCount.innerHTML = maxHotboxTranscripts;

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

    const divTranscripts = document.getElementById('divTranscripts');
    const divHotboxTranscripts = document.getElementById('divHotboxTranscripts');

    if (!divTranscripts || !divHotboxTranscripts) {
        console.error("Required DOM elements for Transcripts are missing.");
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
                    let hotboxTranscript = processDetectorTransript(`${transcript}`);
                    if (hotboxTranscript) {
                        sendBrowserNotification(hotboxTranscript);
                        finalHotboxTranscript = htmlFormatHotboxTranscript(hotboxTranscript) + finalHotboxTranscript;
                    }
                    finalTranscript = htmlFormatTranscript(transcript) + finalTranscript;
                } else {
                    interimTranscript += transcript;
                }
            }

            if (interimTranscript) {
                divTranscripts.innerHTML = '<div><i style=\'color:#999999;\'>' + interimTranscript + '</i>' + finalTranscript;
            } else {
                divTranscripts.innerHTML = finalTranscript;
                divHotboxTranscripts.innerHTML = finalHotboxTranscript;
                TranscriptCounter++;
            }

            // Trim the number of Transcripts to prevent the page from becoming too large.
            if (TranscriptCounter > maxTranscripts) {
                const divTranscriptBeforeTrimmedTranscripts = document.getElementById(`divTranscript${TranscriptCounter - maxTranscripts}`);
                if (divTranscriptBeforeTrimmedTranscripts) {
                    let nextSibling = divTranscriptBeforeTrimmedTranscripts.nextElementSibling;
                    while (nextSibling) {
                        const toRemove = nextSibling;
                        nextSibling = nextSibling.nextElementSibling;
                        toRemove.remove();
                    }
                }
            }

            if (hotboxTranscriptCounter > maxHotboxTranscripts) {
                const divTranscriptBeforeTrimmedTranscripts = document.getElementById(`divHotboxTranscript${hotboxTranscriptCounter - maxHotboxTranscripts}`);
                if (divTranscriptBeforeTrimmedTranscripts) {
                    let nextSibling = divTranscriptBeforeTrimmedTranscripts.nextElementSibling;
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
                    divTranscripts.innerHTML = error;
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

            divTranscripts.innerHTML = '<div>' + error + '</div>' + finalTranscript;
            speechListenerStopped = true;
            stopSpeechAPI();
        };

        recognition.start();
    }
    else {
        divTranscripts.innerHTML = 'Speech recognition is not supported by this browser.';
    }

    return;
}

function htmlFormatTranscript(transcript) {
    return '<div id=\'divTranscript' + TranscriptCounter + '\'>' + spanTimestamp() + signalSourceIconChooser(transcript) + ' ' + transcript + '</div>';
}

function sendBrowserNotification(body) {
    if ('Notification' in window) {
        if (Notification.permission === 'granted') {
            const title = 'Hot Box Detector Alert!';
            const options = {
                body: body,
                icon: '../images/fab.jpeg',
                requireInteraction: false,
            };
            new Notification(title, options);
        }
        else if (Notification.permission !== 'denied') {
            Notification.requestPermission().then(function (permission) {
                if (permission === 'granted') {
                    new Notification('You have granted notification permission.');
                }
            });
        }
    } else {
        console.log('Notifications are not supported by this browser.');
    }
}

function sanitizeHTML(input) {
    const tempDiv = document.createElement('div');
    tempDiv.textContent = input;
    return tempDiv.innerHTML;
}

function processDetectorTransript(hotboxTranscript) {

    hotboxTranscript = replaceWords(hotboxTranscript);
    hotboxTranscript = replaceNonAlphNumericCharacters(hotboxTranscript);

    let transcriptIsDetector = isDetectorTranscript(hotboxTranscript);
    let transcriptContainsDirection = containsDirection(hotboxTranscript);

    if (!transcriptIsDetector && !transcriptContainsDirection) {
        return '';
    }

    // Determine the key for the dictionary entry based on what is found in the transcript.
    let key = '';
    if (transcriptIsDetector && transcriptContainsDirection) {
        key = 'both';
    } else if (transcriptIsDetector) {
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

        hotboxTranscriptCounter++;
        hotboxTranscriptsDictionary = [];

        bothTranscript = detectorLocation(bothTranscript) + bothTranscript;

        return bothTranscript.trim();
    }

    // If queue has more than 5 items and no valid Transcripts, clear the queue.
    if (hotboxTranscriptsDictionary.length > 5) {
        hotboxTranscriptsDictionary = [];
    }

    return '';
}

/**
 * Add the hotbox and direction icon to beginning of transcript. Format the end of train transcript with a dark 
 * grey text as it's not the primary hotmbox notification.
 * @param {*} transcript Hotbox trainscript to be formatted.
 * @returns HTML formatted transcript with icons.
 */
function htmlFormatHotboxTranscript(transcript) {
    if (!transcript) return '';

    let isEndOfTrainTranscript = transcript.toLocaleLowerCase().includes('temperature') || transcript.includes('axles') || transcript.includes('defects') || transcript.includes('speed');
    if (isEndOfTrainTranscript) {
        transcript = '<span style=\'color:#999999;\'>' + transcript.trim() + '</spon>';
    }

    let transcriptWithIcons = spanTowerBroadCastIcon() + directionIcon(transcript) + ' ' + transcript;
    let htmlTranscript = `<div id='divHotboxTranscript${hotboxTranscriptCounter}'>${transcriptWithIcons}</div>`;

    return htmlTranscript;
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
    let detectorPoints = 0;
    if (transcript.toLowerCase().includes('detector')) { detectorPoints++; }
    if (transcript.toLowerCase().includes('mile')) { detectorPoints++; }
    if (transcript.toLowerCase().includes('defects')) { detectorPoints++; }
    if (transcript.toLowerCase().includes('axle')) { detectorPoints++; }
    if (transcript.toLowerCase().includes('speed')) { detectorPoints++; }
    if (transcript.toLowerCase().includes('temperature')) { detectorPoints++; }

    if (detectorPoints >= 2) {
        return '<i class=\'fa-solid fa-tower-broadcast fa-sm\' title=\'Hot Box Detector\'></i>';
    }

    return '<i class=\'fa-solid fa-walkie-talkie fa-sm\' title=\'Walkie-Talkie\'></i>';
}

export { processDetectorTransript };