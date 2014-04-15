if ( document.addEventListener ) {
    // Use the handy event callback
    document.addEventListener( "DOMContentLoaded", function(){
        document.removeEventListener( "DOMContentLoaded", arguments.callee, false );
        gotoMenu();
    }, false );
}
var menuHtml = '';
function gotoMenu() {
    $('#container').className = 'animated fadeOut';
    loadingManager.totalObjects = 1;
    loadingManager.loadedCallback = showMenu;
    ajax('files/content/menu.html', function(data) {
        menuHtml = data;
        loadingManager.objectLoaded();
    });
}

/**
 * Display the main menu of the game and enable the menu to work with the popups.
 */
function showMenu() {
    if (gameOptions != null && gameOptions.inGame != null) {
        gameOptions.inGame = false;
    }
    $('#container').className = 'background-menu animated fadeIn';
    $('#container').innerHTML = menuHtml;

    // Menu items
    document.body.addEventListener('click', function(event) {
        hideInfoWindows();
    });
    infoWindows = document.getElementsByClassName('info-window');
    for (i = 0; i < infoWindows.length; i++) {
        // Do not fire normal clicks on this div
        infoWindows[i].addEventListener('click', function(event) {
            event.stopPropagation();
        });
        linkId = infoWindows[i].id.replace(/window-/, '');
        document.getElementById(linkId).addEventListener('click', function(event) {
            linkId = this.id;
            event.stopPropagation();
            hideInfoWindows();
            if (linkId == 'options') {
                getOptions();
            }
            else {
                document.getElementById('window-' + linkId).className = 'info-window animated fadeIn';
            }
        });
    }

    document.getElementById('start').addEventListener('click', function() {
        launchFullscreen();
        gotoMissions();
    });

    document.getElementById('exit').addEventListener('click', function() {
        exitFullscreen();
        exit();
    });
}

/**
 * Get current available missions
 */
var missionHtml;
var missions = new Array();
function gotoMissions() {
    $('#container').className = 'animated fadeOut';
    missions = new Array();
    loadingManager.totalObjects = gameSettings.availableMissions.length + 1;
    loadingManager.loadedCallback = showMissions;
    for (i = 1; i <= gameSettings.availableMissions.length; i++) {
        ajax('files/levels/'+ i +'.json', function(data) {
            data = JSON.parse(data);
            missions[data.code] = data;
            loadingManager.objectLoaded();
        });
    }
    ajax('files/content/missions.html', function(data) {
        missionHtml = data;
        loadingManager.objectLoaded();
    })
}

function showMissions() {
    $('#container').innerHTML = missionHtml;
    missions.forEach(function(mission, i) {
        if (typeof gameSettings.unlockedMissions[i] != 'undefined') {
            link = '<a id="mission_'+ i +'">'+ mission.name +'</a>';
        }
        else {
            link = '<a class="disabled">'+ mission.name +'</a>';
        }
        $('#missions').innerHTML = $('#missions').innerHTML + link;
    });

    missions.forEach(function(mission, i) {
        if (typeof gameSettings.unlockedMissions[i] != 'undefined') {
            $('#mission_'+ i).addEventListener('click', function() {
                loadMission(i);
                element.requestPointerLock = element.requestPointerLock || element.mozRequestPointerLock || element.webkitRequestPointerLock;
                element.requestPointerLock();
            });
        }
    });

    $('#menu').addEventListener('click', function() {
        gotoMenu();
    });

    $('#container').className = 'background-mission animated fadeIn';
}

// Loads all objects and textures for the selected mission and stats the mission after.
function loadMission(missionCode) {
    gameObjects = new Object();
    manager = new THREE.LoadingManager();
    $('#container').innerHTML = 'Loading mission ' + missionCode;
    loadingManager.totalObjects = 0;
    loadingManager.loadedCallback = function() { playMission(missionCode); }
    missions[missionCode].objects.forEach(function(object, i) {
        if (object.file != null) {
            loadingManager.totalObjects++;
            gameObjects[object.ref] = new Object();
            // load file
            loader = new THREE.OBJLoader(manager);
            loader.load(object.file, function (newObject) {
                gameObjects[object.ref] = newObject.children[0];
                loadingManager.objectLoaded();
            });
        }
    });
    missions[missionCode].textures.forEach(function(texture, i) {
        if (texture.file != null) {
            loadingManager.totalObjects++;
            // load file
            gameObjects['texture-' + texture.ref] = new THREE.Texture();
            loader = new THREE.ImageLoader(manager);
            loader.load(texture.file, function (image) {
                gameObjects['texture-' + texture.ref].image = image;
                gameObjects['texture-' + texture.ref].needsUpdate = true;
                loadingManager.objectLoaded();
            });
        }
    });

    defaultObjects.forEach(function(object, i) {
        loadingManager.totalObjects++;
        gameObjects[object.ref] = new Object();
        // load file
        loader = new THREE.OBJLoader(manager);
        loader.load(object.file, function (newObject) {
            gameObjects[object.ref] = newObject.children[0];
            loadingManager.objectLoaded();
        });
    });

    defaultTextures.forEach(function(texture, i) {
        gameObjects['texture-' + texture.ref] = new THREE.Texture();
        loader = new THREE.ImageLoader(manager);
        loader.load(texture.file, function (image) {
            gameObjects['texture-' + texture.ref].image = image;
            gameObjects['texture-' + texture.ref].needsUpdate = true;
            loadingManager.objectLoaded();
        });

    });

    // http://www.html5rocks.com/en/tutorials/webaudio/intro/js/rhythm-sample.js
    var context = false;
    if (typeof AudioContext == 'function') {
        context = new AudioContext();
    }
    if (context) {
        if (missions[missionCode].sounds != null) {
            missions[missionCode].sounds.forEach(function(sound, i) {
                if (sound.file != null) {
                    loadingManager.totalObjects++;
                    // load file
                    gameObjects['sound-' + sound.ref] = '';
                    ajax(sound.file, function(data) {
                        loadingManager.objectLoaded();
                        context.decodeAudioData(data, function(buffer) {
                            gameObjects['sound-' + sound.ref] = {
                                play: function() {
                                    if (gameSettings.effects == false) {
                                        return false;
                                    }
                                    var source = context.createBufferSource();
                                    source.buffer = buffer;
                                    source.connect(context.destination);
                                    if (!source.start)
                                        source.start = source.noteOn;
                                    source.start(0);
                                }
                            };
                        });
                    }, '', 'arraybuffer');
                }
            });
        }

        defaultSounds.forEach(function(sound, i) {
            loadingManager.totalObjects++;
            // load file
            gameObjects['sound-' + defaultSounds[i].ref] = {play: function(){console.log('Sound "'+ defaultSounds[i].ref +'" not loaded...');}};
            ajax(defaultSounds[i].file, function(data) {
                loadingManager.objectLoaded();
                try {
                    context.decodeAudioData(data, function(buffer) {
                        gameObjects['sound-' + defaultSounds[i].ref] = {
                            play: function() {
                                if (gameSettings.effects == false) {
                                    return false;
                                }
                                var source = context.createBufferSource();
                                source.buffer = buffer;
                                source.connect(context.destination);
                                if (!source.start)
                                    source.start = source.noteOn;
                                source.start(0);
                            }
                        };
                    });
                }
                catch(e) {

                }
            }, '', 'arraybuffer');
        });
    }
}

function hideInfoWindows() {
    infoWindows = document.getElementsByClassName('info-window animated fadeIn');
    for (i = 0; i < infoWindows.length; i++) {
        infoWindows[i].className = 'info-window hidden';
    }
}

function getOptions() {
    ajax('files/content/options.html', function(data) {
        $('#window-options').innerHTML = data;
        $('#window-options').className = 'info-window animated fadeIn';
        if (gameSettings.quality == 'high') {
            document.getElementById('SettingsQualityHigh').checked = true;
        }
        else {
            document.getElementById('SettingsQualityLow').checked = true;
        }
        if (gameSettings.music == "true" || gameSettings.music == true) {
            document.getElementById('SettingsMusicOn').checked = true;
        }
        else {
            document.getElementById('SettingsMusicOff').checked = true;
        }
        if (gameSettings.effects == "true" || gameSettings.effects == true) {
            document.getElementById('SettingsEffectsOn').checked = true;
        }
        else {
            document.getElementById('SettingsEffectsOff').checked = true;
        }
        if (gameSettings.controls == "keyboard") {
            document.getElementById('SettingsControlsKeyboard').checked = true;
        }
        else {
            document.getElementById('SettingsControlsMouse').checked = true;
        }
    });
    return true;
}

function saveSettings() {
    if (window.localStorage) {
        quality = 'high';
        if (document.getElementById('SettingsQualityLow').checked) {
            quality = 'low';
        }
        window.localStorage.setItem('gameSettings.quality', quality);
        gameSettings.quality = quality;
        music = true;
        if (document.getElementById('SettingsMusicOff').checked) {
            music = false;
        }
        window.localStorage.setItem('gameSettings.music', music);
        gameSettings.music = music;

        effects = true;
        if (document.getElementById('SettingsEffectsOff').checked) {
            effects = false;
        }
        window.localStorage.setItem('gameSettings.effects', effects);
        gameSettings.effects = effects;

        controls = 'mouse';
        if (document.getElementById('SettingsControlsKeyboard').checked) {
            controls = 'keyboard';
        }
        window.localStorage.setItem('gameSettings.controls', controls);
        gameSettings.controls = controls;
    }
    hideInfoWindows();
    return false;
}