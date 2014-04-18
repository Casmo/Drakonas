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
    "price":            10000,
    "geometry":         new THREE.CubeGeometry(.2,.2,.2),
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
            z: 60,
            "duration": 750,
            "easing": "Linear.None"
        }
    ]
//    "animation":        [
//        {
//            x: 0,
//            y: -20,
//            z: 15,
//            "duration": 350,
//            "easing": "Sinusoidal.In"
//        },
//        {
//            x: 0,
//            y: -20,
//            z: 60,
//            "duration": 750,
//            "easing": "Sinusoidal.Out"
//        }
//    ]
}
availableWeapons[1]       = {
    "name":             "Plasma cannon",
    "description":      "",
    "longDescription":  "",
    "price":            25000,
    "geometry":         new THREE.CubeGeometry(.2,.2,.8),
    "texture":          new THREE.MeshBasicMaterial ({color: 0xff0000}),
    "interval":         1000,
    "lastShot":         new Date().getTime(),
    "damage":           5,
    "offset":           {
        x: 0,
        y: -1,
        z: 2
    },
    "animation":        [
        {
            x: -.75,
            y: -1,
            z: 60,
            "duration": 1500,
            "easing": "Linear.None"
        }
    ]
}
availableWeapons[2]       = {
    "name":             "Left air missle",
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
        x: -1.8,
        y: -1,
        z: 1.7
    },
    "animation":        [
        {
            x: -1.83,
            y: -1,
            z: 1.7,
            "duration": 500,
            "easing": "Bounce.In"
        },
        {
            x: -1.83,
            y: -1,
            z: 60,
            "duration": 1250,
            "easing": "Sinusoidal.In"
        }
    ]
}
availableWeapons[3]       = {
    "name":             "Right air missle",
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
        x: 1.8,
        y: -1,
        z: 1.7
    },
    "animation":        [
        {
            x: 1.8,
            y: -1,
            z: 1.7,
            "duration": 800,
            "easing": "Bounce.In"
        },
        {
            x: 1.8,
            y: -1,
            z: 60,
            "duration": 1250,
            "easing": "Sinusoidal.In"
        }
    ]
}