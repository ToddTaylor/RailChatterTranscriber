import { containsDirection, containsDetector, capitalizeFirstLetter, isDetectorTranscript, getTime, replaceNonAlphNumericCharacters, replaceWords } from './string-utils.js';
var recognition = null;
var finalTranscript = '';
var finalHotboxTranscript = '';
var speechListenerStopped = false;
var hotboxTranscriptsDictionary = [];
var TranscriptCounter = 0;
var hotboxTranscriptCounter = 0;
var maxTranscripts = 200;
var maxHotboxTranscripts = 100;
var networkConnectionRetryCount = 0;
var directionIconDictionary = [{
  keyWord: "north",
  icon: "<i class='fa-solid fa-arrow-up fa-sm' title='Northbound'></i>"
}, {
  keyWord: "south",
  icon: "<i class='fa-solid fa-arrow-down fa-sm' title='Southbound'></i>"
}, {
  keyWord: "east",
  icon: "<i class='fa-solid fa-arrow-right fa-sm' title='Eastbound'></i>"
}, {
  keyWord: "west",
  icon: "<i class='fa-solid fa-arrow-left fa-sm' title='Westbound'></i>"
}];
var detectorDictionary = [{
  milepost: "94.0",
  railroad: "cn",
  location: "Waukesha"
}, {
  milepost: "108.8",
  railroad: "cn",
  location: "Sussex"
}, {
  milepost: "123.14",
  railroad: "cn",
  location: "Slinger"
}];
window.onload = function onload() {
  var btnStartListening = document.getElementById('btnStartListening');
  var btnStopListening = document.getElementById('btnStopListening');
  var spanMaxTranscriptCount = document.getElementById('spanMaxTranscriptCount');
  var spanMaxHotboxTranscriptCount = document.getElementById('spanMaxHotboxTranscriptCount');
  var iconWalkieTalkie = document.getElementById('iconWalkieTalkie');
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
};
function detectorLocation(transcript) {
  if (!transcript) return '';
  for (var i = 0; i < detectorDictionary.length; i++) {
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
  for (var i = 0; i < directionIconDictionary.length; i++) {
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
  var btnStartListening = document.getElementById('btnStartListening');
  var btnStopListening = document.getElementById('btnStopListening');
  var iconWalkieTalkie = document.getElementById('iconWalkieTalkie');
  if (btnStartListening) btnStartListening.disabled = true;
  if (btnStopListening) btnStopListening.disabled = false;
  if (iconWalkieTalkie) {
    iconWalkieTalkie.className = 'fa-solid fa-walkie-talkie fa-2xl';
    iconWalkieTalkie.style.color = '#00ff37';
  }
  return;
}
function stopSpeechAPI() {
  var btnStartListening = document.getElementById('btnStartListening');
  var btnStopListening = document.getElementById('btnStopListening');
  var iconWalkieTalkie = document.getElementById('iconWalkieTalkie');
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
  var SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  var divTranscripts = document.getElementById('divTranscripts');
  var divHotboxTranscripts = document.getElementById('divHotboxTranscripts');
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
      var interimTranscript = '';
      for (var i = event.resultIndex; i < event.results.length; i++) {
        var transcript = sanitizeHTML(event.results[i][0].transcript);
        if (transcript.trim().length === 0) {
          continue;
        }
        if (event.results[i].isFinal) {
          // Transcript is "cloned" before passing into detector function.  See https://stackoverflow.com/a/59293003/4297541
          finalHotboxTranscript = processDetectorTransript("".concat(transcript)) + finalHotboxTranscript;
          finalTranscript = '<div id=\'divTranscript' + TranscriptCounter + '\'>' + spanTimestamp() + signalSourceIconChooser(transcript) + ' ' + transcript + '</div>' + finalTranscript;
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
        var divTranscriptBeforeTrimmedTranscripts = document.getElementById("divTranscript".concat(TranscriptCounter - maxTranscripts));
        if (divTranscriptBeforeTrimmedTranscripts) {
          var nextSibling = divTranscriptBeforeTrimmedTranscripts.nextElementSibling;
          while (nextSibling) {
            var toRemove = nextSibling;
            nextSibling = nextSibling.nextElementSibling;
            toRemove.remove();
          }
        }
      }
      if (hotboxTranscriptCounter > maxHotboxTranscripts) {
        var _divTranscriptBeforeTrimmedTranscripts = document.getElementById("divHotboxTranscript".concat(hotboxTranscriptCounter - maxHotboxTranscripts));
        if (_divTranscriptBeforeTrimmedTranscripts) {
          var _nextSibling = _divTranscriptBeforeTrimmedTranscripts.nextElementSibling;
          while (_nextSibling) {
            var _toRemove = _nextSibling;
            _nextSibling = _nextSibling.nextElementSibling;
            _toRemove.remove();
          }
        }
      }
    };
    recognition.onstart = function () {
      var btnStartListening = document.getElementById('btnStartListening');
      var btnStopListening = document.getElementById('btnStopListening');
      if (btnStartListening) btnStartListening.disabled = true;
      if (btnStopListening) btnStopListening.disabled = false;
    };

    // Automatically restart the recognition process after it ends (to prevent timeouts)
    recognition.onend = function () {
      if (!speechListenerStopped && networkConnectionRetryCount < 3) {
        // If the 'stop listening' button was not explicitly pressed, start listening again.
        startSpeechAPI();
      } else {
        console.warn("Speech recognition stopped after multiple retries.");
      }
    };
    recognition.onabort = function () {
      console.log('Speech recognition was aborted.');
    };
    recognition.onerror = function (event) {
      var error = spanErrorIcon();

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
  } else {
    divTranscripts.innerHTML = 'Speech recognition is not supported by this browser.';
  }
  return;
}
function sanitizeHTML(input) {
  var tempDiv = document.createElement('div');
  tempDiv.textContent = input;
  return tempDiv.innerHTML;
}
function processDetectorTransript(hotboxTranscript) {
  hotboxTranscript = replaceWords(hotboxTranscript);
  hotboxTranscript = replaceNonAlphNumericCharacters(hotboxTranscript);
  var transcriptIsDetector = isDetectorTranscript(hotboxTranscript);
  var transcriptContainsDirection = containsDirection(hotboxTranscript);
  if (!transcriptIsDetector && !transcriptContainsDirection) {
    return '';
  }

  // Determine the key for the dictionary entry based on what is found in the transcript.
  var key = '';
  if (transcriptIsDetector && transcriptContainsDirection) {
    key = 'both';
  } else if (transcriptIsDetector) {
    key = 'detector';
  } else if (transcriptContainsDirection) {
    // If there's a direction but no detector, check if the dictionary contains "detector" already.
    var _detectorFound = hotboxTranscriptsDictionary.some(function (item) {
      return item.key === 'detector';
    });
    if (!_detectorFound) return '';
    key = 'direction';
  }

  // If a key is set, push the corresponding entry to the dictionary.
  if (key) {
    hotboxTranscriptsDictionary.push({
      key: key,
      value: hotboxTranscript
    });
  }

  // Search for the necessary dictionary entries.
  var bothFound = hotboxTranscriptsDictionary.some(function (item) {
    return item.key === 'both';
  });
  var detectorFound = hotboxTranscriptsDictionary.some(function (item) {
    return item.key === 'detector';
  });
  var directionFound = hotboxTranscriptsDictionary.some(function (item) {
    return item.key === 'direction';
  });
  var bothTranscript = '';
  if (bothFound) {
    var bothTranscriptObject = hotboxTranscriptsDictionary.find(function (item) {
      return item.key === 'both';
    });
    bothTranscript = capitalizeFirstLetter(bothTranscriptObject.value);
  } else if (detectorFound && directionFound) {
    var detectorTranscriptObject = hotboxTranscriptsDictionary.find(function (item) {
      return item.key === 'detector';
    });
    var directionTranscriptObject = hotboxTranscriptsDictionary.find(function (item) {
      return item.key === 'direction';
    });
    var detectorTranscript = capitalizeFirstLetter(detectorTranscriptObject.value);
    var directionTranscript = capitalizeFirstLetter(directionTranscriptObject.value);
    bothTranscript = "".concat(detectorTranscript, " ").concat(directionTranscript);
  }
  if (bothTranscript) {
    bothTranscript = detectorLocation(bothTranscript) + bothTranscript;
    var isEndOfTrainTranscript = bothTranscript.toLocaleLowerCase().includes('temperature') || bothTranscript.includes('axles') || bothTranscript.includes('defects') || bothTranscript.includes('speed');
    if (isEndOfTrainTranscript) {
      bothTranscript = '<span style=\'color:#999999;\'>' + bothTranscript + '</spon>';
    }
    var baseHotboxTranscript = spanTowerBroadCastIcon() + directionIcon(bothTranscript) + ' ' + bothTranscript;
    var hotboxTranscriptHTML = "<div id='divHotboxTranscript".concat(hotboxTranscriptCounter, "'>").concat(baseHotboxTranscript, "</div>");
    hotboxTranscriptCounter++;
    hotboxTranscriptsDictionary = [];
    return hotboxTranscriptHTML.trim();
  }

  // If queue has more than 5 items and no valid Transcripts, clear the queue.
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
export { processDetectorTransript };