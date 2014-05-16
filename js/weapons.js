/**
 * All weapons that are available in game. Most weapons can be bought and will be in the
 * currentWeapons array.
 * @type {Array}
 */
var availableWeapons = new Array();
availableWeapons[0]       = {
    "name":             "Single Machine Gun",
    "description":      "Very fast machine gun. Shooting both ground and air targets.",
    "longDescription":  "Very fast machine gun. Shooting both ground and air targets.",
    "price":            5000,
    "sellPrice":        5000, // Make sure that the player can not sell himself bankrupt.
    "geometry":         new THREE.BoxGeometry(.2,.2,.2),
    "texture":          new THREE.MeshBasicMaterial ({color: 0xffffff}),
    "interval":         75,
    "sound":            "sound-weapon-default",
    "lastShot":         new Date().getTime(),
    "damage":           1,
    "offset":           {
        x: 0,
        y: -1,
        z: 2
    },
    "animation":        [
        {
            x: 0,
            y: -1,
            z: 50,
            "duration": 350,
            "easing": "Linear.None"
        }
    ]
}
availableWeapons[1]       = {
    "name":             "Plasma cannon",
    "description":      "",
    "longDescription":  "",
    "price":            25000,
    "geometry":         new THREE.BoxGeometry(.2,.2,.8),
    "texture":          new THREE.MeshBasicMaterial ({color: 0xff0000}),
    "interval":         1000,
    "lastShot":         new Date().getTime(),
    "damage":           5,
    "sound":            "sound-weapon-plasma",
    "offset":           {
        x: 0,
        y: -1,
        z: 2
    },
    "animation":        [
        {
            x: 0,
            y: -1,
            z: 60,
            "duration": 1500,
            "easing": "Linear.None"
        }
    ]
}
availableWeapons[2]       = {
    "name":             "Right air missle",
    "description":      "",
    "longDescription":  "",
    "price":            35000,
    "ref":              "missle-basic-001",
    "texture_ref":      "missle-basic-001",
    "interval":         350,
    "lastShot":         new Date().getTime(),
    "damage":           10,
    "scale":            {
        "x": 2.5,
        "y": 2.5,
        "z": 2.5
    },
    "offset":           {
        x: -1.6,
        y: -1,
        z: .2
    },
    "animation":        [
        {
            x: 0,
            y: -.5,
            z: 2,
            "duration": 350,
            "easing": "Back.Out"
        },
        {
            x: 0,
            y: 0,
            z: 60,
            "duration": 750,
            "easing": "Quadratic.In"
        }
    ]
}
availableWeapons[3]       = {
    "name":             "Left air missle",
    "description":      "",
    "longDescription":  "",
    "price":            35000,
    "ref":              "missle-basic-001",
    "texture_ref":      "missle-basic-001",
    "interval":         350,
    "lastShot":         new Date().getTime(),
    "easing":           "Quintic.In",
    "duration":         1250,
    "damage":           10,
    "scale":            {
        "x": 2.5,
        "y": 2.5,
        "z": 2.5
    },
    "offset":           {
        x: 1.6,
        y: -1,
        z:.2
    },
    "animation":        [
        {
            x: 0,
            y: -.5,
            z: 2,
            "duration": 350,
            "easing": "Back.Out"
        },
        {
            x: 0,
            y: 0,
            z: 60,
            "duration": 750,
            "easing": "Quadratic.In"
        }
    ]
}