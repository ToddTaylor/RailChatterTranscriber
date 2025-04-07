import { processDetectorTransript } from '../src/index.js';

// TIP: Use test.only() to run only one test case.

describe('Index Test Cases', () => {

    test('Defect detector alert in two lines', () => {
        let transcripts =
            [
                'CN detEctOr mile 108.8.',
                'N found'
            ];

        let expected =
            [
                '',
                'CN detector mile 108.8. Northbound'
            ];

        testTranscripts(transcripts, expected);
    });

    test('Defect detector alert in two lines with details', () => {
        let transcripts =
            [
                'CN detector mile 108.8.',
                'South found no defects. Temperature 35F, Total axles 32, speed 3/8, detector out.'
            ];

        let expected =
            [
                '',
                'CN detector mile 108.8. Southbound no defects. '
            ];

        testTranscripts(transcripts, expected);
    });

    test('Combination of crew chatter and defect detector alert', () => {
        let transcripts =
            [
                '19954430 Waukesha so means contained Ave. North.',
                '19, 9544 Thirty. We enter Waukesha.',
                '1 Two 3.14.',
                'OK, sounds good. Alright, alright.',
                'CN detector mile 123.14.',
                'Thou found no defects. Temperature 30F, total actual 452-D38.',
                'Detector out.'
            ];

        var expected =
            [
                '',
                '',
                '',
                '',
                '',
                'CN detector mile 123.14. Southbound no defects. Temperature 30F total actual 452D38.',
                ''
            ];

        testTranscripts(transcripts, expected);
    });

    test('Crew chatter that is not a defect detector alert', () => {
        let transcripts =
            [
                'I was just waiting for the detector to finish. I got a northbound coming out Marshall third one.'
            ];

        var expected =
            [
                ''
            ];

        testTranscripts(transcripts, expected);
    });

    test('Sussex detector alert', () => {
        let transcripts =
            [
                'CN detector mile 108.8.',
                'North found no defects. Temperature 37F.',
                'Total axle 368, Speed 24.',
                'Detector out.'
            ];

        var expected =
            [
                '',
                '(Sussex) CN detector mile 108.8. Northbound no defects. Temperature 37F.',
                '',
                ''
            ];

        testTranscripts(transcripts, expected);
    });

    function testTranscripts(transcripts, expected) {
        var actuals = [];

        for (let i = 0; i < transcripts.length; i++) {
            var actual = processDetectorTransript(transcripts[i]);
            actuals.push(actual);
        }

        for (let i = 0; i < actuals.length; i++) {
            if (expected[i] == '') {
                expect(actuals[i]).toBe('');
            }
            else {
                expect(actuals[i]).toBeDefined();
                expect(actuals[i]).toContain(expected[i])
            };
        }
    }
})