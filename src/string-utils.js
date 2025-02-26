// The '.' character is a wildcard in regular expressions.
// https://regexkit.com/javascript-regex
let wordDictionary = [];
wordDictionary.push(
    { searchMask: "detector out", replaceWord: "" },
    { searchMask: ".m detector", replaceWord: "CN detector" },
    { searchMask: ".n detector", replaceWord: "CN detector" },
    { searchMask: "end detector", replaceWord: "CN detector" },
    { searchMask: "defector", replaceWord: "detector" },
    { searchMask: "sector", replaceWord: "detector" },
    { searchMask: "n .ound", replaceWord: "northbound" },
    { searchMask: "north found", replaceWord: "northbound" },
    { searchMask: "n .ound", replaceWord: "northbound" },
    { searchMask: "s .ound", replaceWord: "southbound" },
    { searchMask: ".ow .ound", replaceWord: "southbound" },
    { searchMask: "south found", replaceWord: "southbound" },
    { searchMask: "thou found", replaceWord: "southbound" },
);

export function containsDetector(transcript) {
    return transcript.toLowerCase().includes('detector');
}

let directions = ["north", "south", "east", "west"];

export function containsDirection(transcript) {
    for (let i = 0; i < directions.length; i++) {
        if (transcript.toLowerCase().includes(directions[i])) {
            return true;
        }
    }

    return false;
}

/**
 * Get the current time in a human-readable format.
 * @returns Returns the current time in a human-readable
 * format (e.g., 12:00:00 PM).
 */
export function getTime() {
    let date = new Date();

    let options = {
        hour: '2-digit',
        minute: 'numeric',
        second: 'numeric',
        hour12: true
    };

    return date.toLocaleString('en-US', options);
}

export function replaceNonAlphNumericCharacters(transcript) {
    return transcript.replace(/[^a-zA-Z\d\s.]/g, '');
}

/**
 * Replace words in the transcript with the correct word based on a predefined word dictionary (key/value pairs).
 * @param {*} transcript Current transcript to be processed.
 * @returns Returns the transcript with the words replaced based on the word dictionary.
 */
export function replaceWords(transcript) {
    for (let i = 0; i < wordDictionary.length; i++) {
        let searchMask = wordDictionary[i].searchMask;
        let regEx = new RegExp(searchMask, 'ig');
        let replaceMask = wordDictionary[i].replaceWord;
        transcript = transcript.replace(regEx, replaceMask);
    }

    return transcript;
}

// module.exports = {
//     containsDetector,
//     containsDirection,
//     getTime,
//     replaceNonAlphNumericCharacters,
//     replaceWords
// };