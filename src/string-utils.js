import { directions, wordDictionary } from './data-dictionaries.js';

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function containsDetector(transcript) {
    return transcript.toLowerCase().includes('detector');
}

/**
 * Determines if the transcript contains a direction.
 * @param {string} transcript Current transcript to be processed.
 * @returns Returns true if the transcript contains a direction, false otherwise.
 * @example If string is "Let's go north", it will return true.
 * @example If string is "There are no directions in this sentence", it will return false.
 */
function containsDirection(transcript) {
    return directions.some(direction => transcript.toLowerCase().includes(direction));
}

/**
 * Finds the first direction in the transcript.
 * @param {string} transcript Current transcript to be processed.
 * @returns First direction found in the transcript or null if none found.
 * @example If string is "Let's go north", it will return "north".
 */
function findDirection(transcript) {
    return directions.find(value => transcript.includes(value)) || null;
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
    let date = new Date();

    let options = {
        hour: '2-digit',
        minute: 'numeric',
        second: 'numeric',
        hour12: true
    };

    return date.toLocaleString('en-US', options);
}

function isDetectorTranscript(transcript) {
    return containsDetector(transcript) &&
        transcript.toLowerCase().includes('mile') &&
        containsNumber(transcript);
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
    for (let i = 0; i < wordDictionary.length; i++) {
        let searchMask = wordDictionary[i].searchMask;
        let regEx = new RegExp(searchMask, 'ig');
        let replaceMask = wordDictionary[i].replaceWord;
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

export {
    isDetectorTranscript,
    containsDetector,
    containsDirection,
    findDirection,
    getTime,
    replaceNonAlphNumericCharacters,
    replaceWords,
    capitalizeFirstLetter,
    removeSpecialCharacters,
    removeExtraSpaces
};