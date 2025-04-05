// The '.' character is a wildcard in regular expressions.
// https://regexkit.com/javascript-regex
var wordDictionary = [{
  searchMask: "detector out",
  replaceWord: ""
}, {
  searchMask: ".m detector",
  replaceWord: "CN detector"
}, {
  searchMask: ".n detector",
  replaceWord: "CN detector"
}, {
  searchMask: ".nd detector",
  replaceWord: "CN detector"
}, {
  searchMask: "defector",
  replaceWord: "detector"
}, {
  searchMask: "sector",
  replaceWord: "detector"
}, {
  searchMask: "n .ound",
  replaceWord: "northbound"
}, {
  searchMask: "north found",
  replaceWord: "northbound"
}, {
  searchMask: "s .ound",
  replaceWord: "southbound"
}, {
  searchMask: ".ow .ound",
  replaceWord: "southbound"
}, {
  searchMask: "south found",
  replaceWord: "southbound"
}, {
  searchMask: "thou found",
  replaceWord: "southbound"
}];
function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}
function containsDetector(transcript) {
  return transcript.toLowerCase().includes('detector');
}
var directions = ["north", "south", "east", "west"];
function containsDirection(transcript) {
  // Simplified loop using Array.prototype.some
  return directions.some(function (direction) {
    return transcript.toLowerCase().includes(direction);
  });
}
function containsNumber(transcript) {
  return /\d/.test(transcript);
}

/**
 * Get the current time in a human-readable format.
 * @returns Returns the current time in a human-readable
 * format (e.g., 12:00:00 PM).
 */
function getTime() {
  var date = new Date();
  var options = {
    hour: '2-digit',
    minute: 'numeric',
    second: 'numeric',
    hour12: true
  };
  return date.toLocaleString('en-US', options);
}
function isDetectorTranscript(transcript) {
  return containsDetector(transcript) && transcript.toLowerCase().includes('mile') && containsNumber(transcript);
}
function replaceNonAlphNumericCharacters(transcript) {
  return transcript.replace(/[^a-zA-Z\d\s.]/g, '');
}

/**
 * Replace words in the transcript with the correct word based on a predefined word dictionary (key/value pairs).
 * @param {*} transcript Current transcript to be processed.
 * @returns Returns the transcript with the words replaced based on the word dictionary.
 */
function replaceWords(transcript) {
  for (var i = 0; i < wordDictionary.length; i++) {
    var searchMask = wordDictionary[i].searchMask;
    var regEx = new RegExp(searchMask, 'ig');
    var replaceMask = wordDictionary[i].replaceWord;
    transcript = transcript.replace(regEx, replaceMask);
  }
  return transcript;
}
function removeSpecialCharacters(string) {
  return string.replace(/[^a-zA-Z0-9 ]/g, '');
}
function removeExtraSpaces(string) {
  return string.replace(/\s+/g, ' ').trim();
}
export { isDetectorTranscript, containsDetector, containsDirection, getTime, replaceNonAlphNumericCharacters, replaceWords, capitalizeFirstLetter, removeSpecialCharacters, removeExtraSpaces };