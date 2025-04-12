let directionIconDictionary = [
    { keyWord: "north", icon: "<i class='fa-solid fa-arrow-up fa-sm' title='Northbound'></i>" },
    { keyWord: "south", icon: "<i class='fa-solid fa-arrow-down fa-sm' title='Southbound'></i>" },
    { keyWord: "east", icon: "<i class='fa-solid fa-arrow-right fa-sm' title='Eastbound'></i>" },
    { keyWord: "west", icon: "<i class='fa-solid fa-arrow-left fa-sm' title='Westbound'></i>" }
];

let detectorDictionary = [
    { milepost: "94.0", railroad: "cn", location: "Waukesha", latitude: 42.960378, longitude: -88.240401 },
    { milepost: "108.8", railroad: "cn", location: "Sussex", latitude: 43.162204, longitude: -88.200229 },
    { milepost: "123.14", railroad: "cn", location: "Slinger", latitude: 43.338023, longitude: -88.290851 }
];

// The '.' character is a wildcard in regular expressions.
// https://regexkit.com/javascript-regex
let wordDictionary = [
    { searchMask: "detector out", replaceWord: "" },
    { searchMask: ".m detector", replaceWord: "CN detector" },
    { searchMask: ".n detector", replaceWord: "CN detector" },
    { searchMask: ".nd detector", replaceWord: "CN detector" },
    { searchMask: "defector", replaceWord: "detector" },
    { searchMask: "sector", replaceWord: "detector" },
    { searchMask: "n .ound", replaceWord: "northbound" },
    { searchMask: "north found", replaceWord: "northbound" },
    { searchMask: "s .ound", replaceWord: "southbound" },
    { searchMask: ".ow .ound", replaceWord: "southbound" },
    { searchMask: "south found", replaceWord: "southbound" },
    { searchMask: "thou found", replaceWord: "southbound" },
];

let directions = ["north", "south", "east", "west"];

export {
    wordDictionary,
    directionIconDictionary,
    detectorDictionary,
    directions
};
