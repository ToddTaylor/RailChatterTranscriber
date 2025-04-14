function toRadians(degrees) {
    return degrees * (Math.PI / 180);
}

function toDegrees(radians) {
    return radians * (180 / Math.PI);
}

function getBearing(lat1, lon1, lat2, lon2) {
    // Convert to radians
    const φ1 = toRadians(lat1);
    const φ2 = toRadians(lat2);
    const Δλ = toRadians(lon2 - lon1);

    const y = Math.sin(Δλ) * Math.cos(φ2);
    const x = Math.cos(φ1) * Math.sin(φ2) -
        Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);
    let θ = Math.atan2(y, x);
    θ = toDegrees(θ);
    return (θ + 360) % 360; // Normalize to 0-360
}

function getCompassDirection(bearing) {
    const directions = [
        "N", "NE", "E", "SE", "S", "SW", "W", "NW", "N"
    ];
    const index = Math.round(bearing / 45);
    return directions[index];
}

function getRelativeDirection(point1, point2) {
    const bearing = getBearing(point1.latitude, point1.longitude, point2.latitude, point2.longitude);
    const direction = getCompassDirection(bearing);
    return direction;
}

function isTrainApproaching(home, detector, trainDirection) {
    let approaching = false;

    const detectorRelativeDirection = getRelativeDirection(home, detector);

    const isNorthbound = trainDirection.toLowerCase().includes("north");
    const isSouthbound = trainDirection.toLowerCase().includes("south");
    const isEastbound = trainDirection.toLowerCase().includes("east");
    const isWestbound = trainDirection.toLowerCase().includes("west");

    if (["N", "NE", "NW"].includes(detectorRelativeDirection) && isSouthbound) {
        approaching = true;
    }
    else if (["S", "SE", "SW"].includes(detectorRelativeDirection) && isNorthbound) {
        approaching = true;
    }
    else if (["E", "NE", "SE"].includes(detectorRelativeDirection) && isWestbound) {
        approaching = true;
    }
    else if (["W", "NW", "SW"].includes(detectorRelativeDirection) && isEastbound) {
        approaching = true;
    }

    return approaching;
}

export {
    getRelativeDirection,
    isTrainApproaching
};