window.AudioContext = window.AudioContext||window.webkitAudioContext||false;
function storageGetItem(key, callback) {
    // for chrome
    try {
        return chrome.storage.sync.get(key, function(value) {
            if (typeof callback == 'function') {
                return callback(value);
            }
            return value;
        });
    }
    catch (e) {
        getValue = window.localStorage.getItem(key);
        if (typeof callback == 'function') {
            return callback(getValue);
        }
        return getValue;
    }
}

/**
 * Saves data in the local storage api.
 * @param key
 * @param value
 * @param callback
 * @returns {*}
 */
function storageSetItem(key, value, callback) {
    try {
        // For chrome
        return chrome.storage.sync.set({key: value}, callback);
    }
    catch (e) {
        setResult = window.localStorage.setItem(key, value);
        if (typeof callback == 'function') {
            return callback(setResult);
        }
        return setResult;
    }
}
var defaultSounds = [
    {
        "ref": "weapon-default",
        "file": "files/sounds/effects/weapon-default.wav"
    },
    {
        "ref": "weapon-plasma",
        "file": "files/sounds/effects/weapon-plasma.wav"
    },
    {
        "ref": "dieing-player",
        "file": "files/sounds/effects/dieing-player.wav"
    },
    {
        "ref": "explosion-phaser",
        "file": "files/sounds/effects/explosion-phaser.wav"
    }
]

var defaultObjects = [
    {
        "ref": "missle-basic-001",
        "file": "files/objects/weapons/missle-basic-001.obj"
    },
    {
        "ref": "hangar-skelet",
        "file": "files/objects/buildings/hangar-skelet.obj"
    },
    {
        "ref": "hangar-building",
        "file": "files/objects/buildings/hangar-building.obj"
    },
    {
        "ref": "hangar-door-frames",
        "file": "files/objects/buildings/hangar-door-frames.obj"
    },
    {
        "ref": "hangar-door-right", // position should be on the ?-as 20.67
        "file": "files/objects/buildings/hangar-door-right.obj"
    },
    {
        "ref": "hangar-door-left", // position should be on the ?-as 20.67
        "file": "files/objects/buildings/hangar-door-left.obj"
    },
    {
        "ref": "hangar-closet",
        "file": "files/objects/buildings/hangar-closet.obj"
    },
    {
        "ref": "hangar-toolbox-1",
        "file": "files/objects/buildings/hangar-toolbox-1.obj"
    },
    {
        "ref": "hangar-toolbox-2",
        "file": "files/objects/buildings/hangar-toolbox-2.obj"
    },
    {
        "ref": "player-hangar",
        "file": "files/objects/player/default.obj"
    },
    {
        "ref": "bullet-yellow",
        "geometry": new THREE.CubeGeometry(2,2,2)
    }
]

var defaultTextures = [
    {
        "ref": "missle-basic-001",
        "file": "files/objects/weapons/missle-basic-001.jpg"
    },
    {
        "ref": "player-hangar",
        "file": "files/objects/player/default.jpg"
    },
    {
        "ref": "hangar-door-frames",
        "file": "files/objects/buildings/hangar-door-frames.jpg"
    },
    {
        "ref": "hangar-skelet",
        "file": "files/objects/buildings/hangar-skelet.jpg"
    },
    {
        "ref": "hangar-door",
        "file": "files/objects/buildings/hangar-door.jpg"
    },
    {
        "ref": "hangar-building",
        "file": "files/objects/buildings/hangar-building.jpg"
    },
    {
        "ref": "hangar-floor",
        "file": "files/objects/buildings/hangar-floor.jpg"
    }
]