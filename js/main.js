window.AudioContext = window.AudioContext||window.webkitAudioContext||false;

var defaultSounds = [
    {
        "ref": "weapon-default",
        "file": "files/sounds/effects/weapon-default.wav"
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
        "ref": "player-hangar",
        "file": "files/objects/player/default.obj"
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
    }

]