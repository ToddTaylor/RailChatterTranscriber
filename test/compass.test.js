import { getRelativeDirection, isTrainApproaching } from '../src/compass.js';

describe("Compass Test Cases", () => {

    const home = {
        "latitude": 43.280925,
        "longitude": -88.214686
    };

    const detectorNorthwest = {
        "latitude": 43.338023,
        "longitude": -88.290851
    };

    const detectorSoutheast = {
        "latitude": 43.221196,
        "longitude": -88.083671
    };

    test('Detector is Northwest of home...', () => {
        let result = getRelativeDirection(home, detectorNorthwest);

        expect(result).toBe("NW");
    });

    test('Detector is Southeast of home...', () => {
        let result = getRelativeDirection(home, detectorSoutheast);

        expect(result).toBe("SE");
    });

    test('Train is approaching from the North...', () => {
        let trainDirection = 'south';

        let result = isTrainApproaching(home, detectorNorthwest, trainDirection);

        expect(result).toBe(true);
    });

    test('Train is approaching from the South...', () => {
        let trainDirection = 'north';

        let result = isTrainApproaching(home, detectorSoutheast, trainDirection);

        expect(result).toBe(true);
    });
})