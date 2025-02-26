import { processDetectorCaption } from '../../src/views/index.js';

// TIP: Use test.only() to run only one test case.

describe('Index Test Cases', () => {

    test('The hotbox text message should be..', () => {
        let transcripts =
            [
                'CN detEctOr',
                'N found'
            ];

        let expected =
            [
                '',
                'CN detector Northbound'
            ];

        testTranscripts(transcripts, expected);
    });

    test('The hotbox text message should be..', () => {
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

    test('The hotbox text message should be..', () => {
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

    function testTranscripts(transcripts, expected) {
        var actuals = [];

        for (let i = 0; i < transcripts.length; i++) {
            var actual = processDetectorCaption(transcripts[i]);
            actuals.push(actual);
        }

        for (let i = 0; i < actuals.length; i++) {
            expect(actuals[i]).toContain(expected[i]);
        }
    }
})