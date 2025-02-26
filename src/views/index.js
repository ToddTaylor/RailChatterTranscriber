let recognition = null;
let finalTranscript = '';
let finalHotboxTranscript = '';
let speechListenerStopped = false;
let captionCounter = 0;
let hotboxCaptionCounter = 0;
let maxCaptions = 200;
let maxHotboxCaptions = 100;
let networkConnectionRetryCount = 0;

// The '.' character is a wildcard in regular expressions.
// https://regexkit.com/javascript-regex
let wordDictionary = [];
wordDictionary.push(
    { searchMask: ".m detector", replaceWord: "CN detector" },
    { searchMask: ".n detector", replaceWord: "CN detector" },
    { searchMask: "end detector", replaceWord: "CN detector" },
    { searchMask: "defector", replaceWord: "detector" },
    { searchMask: "sector", replaceWord: "detector" },
    { searchMask: "n bound", replaceWord: "northbound" },
    { searchMask: "north found", replaceWord: "northbound" },
    { searchMask: "n .ound", replaceWord: "northbound" },
    { searchMask: "s .ound", replaceWord: "southbound" }
);

let directionIconDictionary = [];
directionIconDictionary.push(
    { keyWord: "north", icon: "<i class=\'fa-solid fa-arrow-up fa-sm\' title=\'Northbound\'></i>" },
    { keyWord: "south", icon: "<i class=\'fa-solid fa-arrow-down fa-sm\' title=\'Southbound\'></i>" },
    { keyWord: "east", icon: "<i class=\'fa-solid fa-arrow-right fa-sm\' title=\'Eastbound\'></i>" },
    { keyWord: "west", icon: "<i class=\'fa-solid fa-arrow-left fa-sm\' title=\'Westbound\'></i>" }
);

let detectorDictionary = [];
detectorDictionary.push(
    { milepost: "94.0", railroad: "cn", location: "Waukesha" },
    { milepost: "108.8", railroad: "cn", location: "Sussex" },
    { milepost: "123.14", railroad: "cn", location: "Slinger" }
);

function onLoad() {

    btnStartListening.addEventListener('click', function (e) {
        speechListenerStopped = false;
        startSpeechAPI();
    });

    btnStopListening.addEventListener('click', function (e) {
        speechListenerStopped = true;
        stopSpeechAPI();
    });

    btnClearCaptions.addEventListener('click', function (e) {
        clearCaptions();
    });

    btnClearHotboxCaptions.addEventListener('click', function (e) {
        clearHotboxCaptions();
    });

    spanMaxCaptionCount.innerHTML = maxCaptions;
    spanMaxHotboxCaptionCount.innerHTML = maxHotboxCaptions;

    setupSpeechAPI();
}

function detectorLocation(transcript) {
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
    for (let i = 0; i < directionIconDictionary.length; i++) {
        if (transcript.toLowerCase().includes(directionIconDictionary[i].keyWord)) {
            return directionIconDictionary[i].icon;
        }
    }

    return '';
}

function clearCaptions() {
    finalTranscript = '';
    divCaptions.innerHTML = '';
}

function clearHotboxCaptions() {
    finalHotboxTranscript = '';
    divHotboxCaptions.innerHTML = '';
}

function startSpeechAPI() {
    if (recognition !== null) {
        recognition.start();

    } else {
        setupSpeechAPI();
    }

    btnStartListening.disabled = true;
    btnStopListening.disabled = false;

    iconMicrophone.className = 'fa-solid fa-microphone-lines fa-2xl';
    iconMicrophone.style.color = '#00ff37';
}

function stopSpeechAPI() {
    if (recognition !== null) {
        recognition.stop();
    }

    btnStartListening.disabled = false;
    btnStopListening.disabled = true;

    iconMicrophone.className = 'fa-solid fa-microphone-lines-slash fa-2xl';
    iconMicrophone.style.color = '#ff0000';
}

/**
 * Get the current time in a human-readable format.
 * @returns Returns the current time in a human-readable
 * format (e.g., 12:00:00 PM).
 */
function getTime() {
    let date = new Date();

    let options = {
        hour: '2-digit',
        minute: 'numeric',
        second: 'numeric',
        hour12: true
    };

    return date.toLocaleString('en-US', options);
}

function setupSpeechAPI() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (SpeechRecognition) {
        recognition = new SpeechRecognition();
        recognition.lang = 'en-US';
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.maxAlternatives = 10;

        recognition.onresult = function (event) {
            let interimTranscript = "";

            for (let i = event.resultIndex; i < event.results.length; i++) {
                let transcript = event.results[i][0].transcript;

                if (transcript.trim().length === 0) {
                    continue;
                }

                if (event.results[i].isFinal) {
                    transcript = replaceWords(transcript);
                    transcript = replaceNonAlphNumericCharacters(transcript);

                    if (isDetectorCaption(transcript)) {
                        let baseHotboxCaption = '<span style=\'color:#999999;\'>' + getTime() + '</span> <i class=\'fa-solid fa-tower-broadcast fa-sm\' title=\'Hot Box Detector\'></i>' + directionIcon(transcript) + detectorLocation(transcript) + transcript;
                        let hotboxTranscript = '<div id=\'divHotboxCaption' + hotboxCaptionCounter + '\'>' + baseHotboxCaption + '</div>';
                        finalHotboxTranscript = hotboxTranscript + finalHotboxTranscript;
                        finalTranscript = '<div id=\'divCaption' + captionCounter + '\'>' + baseHotboxCaption + '</div>' + finalTranscript;
                    } else {
                        finalTranscript = '<div id=\'divCaption' + captionCounter + '\'><i style=\'color:#999999;\'>' + getTime() + '</i> <i class=\'fa-solid fa-walkie-talkie fa-sm\' title=\'Walkie-Talkie\'></i> ' + transcript + '</div>' + finalTranscript;
                    }
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
                let divCaptionBeforeTrimmedCaptions = '#divCaption' + (captionCounter - maxCaptions);
                $(divCaptionBeforeTrimmedCaptions).nextAll('div').remove();
            }

            if (hotboxCaptionCounter > maxHotboxCaptions) {
                let divCaptionBeforeTrimmedCaptions = '#divHotboxCaption' + (hotboxCaptionCounter - maxHotboxCaptions);
                $(divCaptionBeforeTrimmedCaptions).nextAll('div').remove();
            }
        };

        recognition.onstart = function () {
            btnStartListening.disabled = true;
            btnStopListening.disabled = false;
        }

        // Automatically restart the recognition process after it ends (to prevent timeouts)
        recognition.onend = function () {
            if (!speechListenerStopped) { // If the 'stop listening' button was not explicitly pressed, start listening again.
                startSpeechAPI();
                //the API seems to stop listening after ~5 minutes so this keeps it going.
            }
        };

        recognition.onabort = () => {
            console.log('Speech recognition was aborted.');
        };

        recognition.onerror = (event) => {
            let error = '<i class=\'fa-solid fa-circle-exclamation fa-sm\' title=\'Error\'></i> ';

            // Add specific error handling based on the error code
            if (event.error === 'no-speech') {
                //error += 'No speech detected, please try again.<br/>';
                // Don't stop just because no speech was detected.
                return;
            } else if (event.error === 'audio-capture') {
                error += 'Audio capture failed, please check your microphone.<br/>';
            } else if (event.error === 'not-allowed') {
                error += 'Speech recognition was not allowed by the user.<br/>';
            } else if (event.error === 'network') {
                if (networkConnectionRetryCount < 3) {
                    stopSpeechAPI();
                    error += 'Network error occurred. Retrying...<br/>';
                    divCaptions.innerHTML = error;
                    networkConnectionRetryCount++;
                    console.log('Network error occurred. Retrying...');
                    startSpeechAPI();
                    return;
                } else {
                    error += 'Unrecoverable network error occurred while trying to access the speech service.<br/>';
                    networkConnectionRetryCount = 0;
                    console.log('Unrecoverable network error occurred while trying to access the speech service.');
                }
            } else {
                error += 'An unknown error occurred: ' + event.error + '<br/>';
            }

            divCaptions.innerHTML = error;
            speechListenerStopped = true;
            stopSpeechAPI();
        };

        recognition.start();
    }
    else {
        divCaptions.innerHTML = 'Speech recognition is not supported by this browser.';
    }
}

function replaceNonAlphNumericCharacters(transcript) {
    return transcript.replace(/[^a-zA-Z\d\s.]/g, '');
}

function isDetectorCaption(transcript) {
    // TODO: Add check for text 'mile' as well to filter-out detector discussions that aren't from Hector.
    if (!transcript.toLowerCase().includes('detector')) {
        return false;
    }

    return true;
}

/**
 * Replace words in the transcript with the correct word based on a predefined word dictionary (key/value pairs).
 * @param {*} transcript Current transcript to be processed.
 * @returns Returns the transcript with the words replaced based on the word dictionary.
 */
function replaceWords(transcript) {
    for (let i = 0; i < wordDictionary.length; i++) {
        let searchMask = wordDictionary[i].searchMask;
        let regEx = new RegExp(searchMask, 'ig');
        let replaceMask = wordDictionary[i].replaceWord;
        transcript = transcript.replace(regEx, replaceMask);
    }

    return transcript;
}
