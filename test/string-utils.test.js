// https://medium.com/@akkutyagi/how-to-debug-jest-tests-in-vs-code-8594b7ea02dc
import {
    containsDetector,
    containsDirection,
    findDirection,
    isDetectorTranscript,
    getTime,
    replaceNonAlphNumericCharacters,
    replaceWords
} from '../src/string-utils.js';

describe("String-Utils Test Cases", () => {
    test("Contains 'detector'", () => {
        let transcript = "CN detEctOr northbound";

        var result = containsDetector(transcript);

        expect(result).toBe(true);
    });

    test("Is not a detector transcript", () => {
        let transcript = "I have 2 apples and 3 oranges";

        var result = isDetectorTranscript(transcript);

        expect(result).toBe(false);
    });

    test("Contains direction 'north'", () => {
        let transcript = "Let's go noRth";

        var result = containsDirection(transcript);

        expect(result).toBe(true);
    });

    test("Contains direction 'south'", () => {
        let transcript = "Let's go soUth";

        var result = containsDirection(transcript);

        expect(result).toBe(true);
    });

    test("Contains direction 'east'", () => {
        let transcript = "Let's go eAst";

        var result = containsDirection(transcript);

        expect(result).toBe(true);
    });

    test("Contains direction 'west'", () => {
        let transcript = "Let's go WeSt";

        var result = containsDirection(transcript);

        expect(result).toBe(true);
    });

    test("Does not contain a direction", () => {
        let transcript = "There are no directions in this sentence";

        var result = containsDirection(transcript);

        expect(result).toBe(false);
    });

    test("Find direction 'north' in transcript", () => {
        let transcript = "CN detEctOr northbound";

        var result = findDirection(transcript);

        expect(result).toBe('north');
    });

    test("Timestamp matches HH:MM:SS AM|PM format", () => {
        var result = getTime();

        expect(result).toMatch(/^([0]?[1-9]|1[0-2]):([0-5]\d):([0-5]\d)\s?(AM|PM)$/);
    });

    test("Does not contain non alpha-numeric characters", () => {
        let transcript = "There are #@(*$)@% in this sentence";

        var result = replaceNonAlphNumericCharacters(transcript);

        expect(result).toBe('There are  in this sentence');
    });

    test("Replace Cow Sounds with southbound", () => {
        let transcript = "This is a Cow Sound and not a train";

        var result = replaceWords(transcript);

        expect(result).toBe('This is a southbound and not a train');
    });

    test("Replace And with CN", () => {
        let transcript = "And detector mile 123.14.";

        var result = replaceWords(transcript);

        expect(result).toBe('CN detector mile 123.14.');
    });
});