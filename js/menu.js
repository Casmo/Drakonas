if ( document.addEventListener ) {
    // Use the handy event callback
    document.addEventListener( "DOMContentLoaded", function(){
        document.removeEventListener( "DOMContentLoaded", arguments.callee, false );
        gotoMenu();
    }, false );
}
var menuHtml = '';
var inHangar = false;
function gotoMenu() {
    loadingManager.totalObjects = 1;
    loadingManager.loadedCallback = showMenu;
    ajax('files/content/menu.html', function(data) {
        menuHtml = data;
        loadingManager.objectLoaded();
    });
    manager = new THREE.LoadingManager();
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
        loadingManager.totalObjects++;
        gameObjects['texture-' + texture.ref] = new THREE.Texture();
        loader = new THREE.ImageLoader(manager);
        loader.load(texture.file, function (image) {
            gameObjects['texture-' + texture.ref].image = image;
            gameObjects['texture-' + texture.ref].needsUpdate = true;
            loadingManager.objectLoaded();
        });
    });
}

/**
 * Display the main menu of the game and enable the menu to work with the popups.
 */
function showMenu() {
    if (gameOptions != null && gameOptions.inGame != null) {
        gameOptions.inGame = false;
    }
    if (gameOptions.spawnObjects != null) {
        clearTimeout(gameOptions.spawnObjects);
    }
    if (gameOptions.requestId != null) {
        cancelAnimationFrame(gameOptions.requestId);
    }
    $('#container').innerHTML = menuHtml;

    // Menu items
    document.body.addEventListener('click', function(event) {
        hideInfoWindows();
    });

    $('#shop').addEventListener('click', getShop, false);

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

    $('#window-credits').addEventListener('click', function() {
        hideInfoWindows();
    }, false);

    document.getElementById('start').addEventListener('click', function() {
        launchFullscreen();
        gotoMissions();
    });

    document.getElementById('exit').addEventListener('click', function() {
        exitFullscreen();
        exit();
    });

    if (inHangar == false) {
        // Enable hangar
        hangar();
        inHangar = true;
    }
    else {
        hangarAnimation();
    }
    controls.enabled = true;
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
    manager = new THREE.LoadingManager();
    $('#container').innerHTML = 'Loading mission ' + missionCode;
    loadingManager.totalObjects = 0;
    loadingManager.loadedCallback = function() {
        setTimeout(function() { playMission(missionCode); }, 5000);
        tweenPlayer = new TWEEN.Tween( {x: 0, y: 0, z: 0} )
            .to( {x: -30, y: 0, z: 0}, 2000 )
            .easing( TWEEN.Easing.Bounce.Out )
            .onUpdate( function () {
                hangarObjects['hangarPlayer'].position.x = this.x;
                hangarObjects['hangarPlayer'].position.y = this.y;
                hangarObjects['hangarPlayer'].position.z = this.z;
            } )
            .start();

        tweenPlayer = new TWEEN.Tween( {x: -30, y: 0, z: 0} )
            .to( {x: -31, y: 0, z: -10}, 1000 )
            .easing( TWEEN.Easing.Bounce.Out )
            .onUpdate( function () {
                hangarObjects['hangarPlayer'].position.x = this.x;
                hangarObjects['hangarPlayer'].position.y = this.y;
                hangarObjects['hangarPlayer'].position.z = this.z;
                hangarObjects['hangarPlayer'].rotation.y -= 0.01;
            } )
            .delay(2000)
            .start();

        tweenPlayer = new TWEEN.Tween( {x: -31, y: 0, z: -10} )
            .to( {x: -31, y: 40, z: -50}, 1500 )
            .easing( TWEEN.Easing.Bounce.Out )
            .onUpdate( function () {
                hangarObjects['hangarPlayer'].position.x = this.x;
                hangarObjects['hangarPlayer'].position.y = this.y;
                hangarObjects['hangarPlayer'].position.z = this.z;
            } )
            .delay(3000)
            .start();
    }
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
            $('#SettingsQualityHigh').checked = true;
        }
        else {
            $('#SettingsQualityLow').checked = true;
        }
        if (gameSettings.music == "true" || gameSettings.music == true) {
            $('#SettingsMusicOn').checked = true;
        }
        else {
            $('#SettingsMusicOff').checked = true;
        }
        if (gameSettings.effects == "true" || gameSettings.effects == true) {
            $('#SettingsEffectsOn').checked = true;
        }
        else {
            $('#SettingsEffectsOff').checked = true;
        }
        if (gameSettings.controls == "keyboard") {
            $('#SettingsControlsKeyboard').checked = true;
        }
        else {
            $('#SettingsControlsMouse').checked = true;
        }
        $('#SaveSettings').removeEventListener('click');
        $('#SaveSettings').addEventListener('click', saveSettings, false);
    });
    return true;
}

var currentShopBullet;
function getShop() {
    cancelAnimationFrame(gameOptions.requestId);
    gameSettings.score = parseInt(window.localStorage.getItem('gameSettings.score'));
    currentWeapons = window.localStorage.getItem('gameSettings.currentWeapons');
    currentWeapons = JSON.parse(currentWeapons);
    ajax('files/content/shop.html', function(data) {
        $('#full-container').innerHTML = data;
        $('#score').innerHTML = gameSettings.score;
        $('#full-container').style.display = 'block';
        $('#full-container').className = 'fadeIn';
        $('#full-container').removeEventListener('click', function() {});
        $('#full-container').addEventListener('click', function() {
            $('#full-container').className = 'fadeOut';
            setTimeout(function() {
                $('#full-container').style.display = 'none';
                scene.remove(currentShopBullet);
                cancelAnimationFrame(gameOptions.requestId);
            }, 500);
        }, false);
        itemsHtml = '';
        availableWeapons.forEach(function(weapon, index) {
            itemsHtml += '<div class="item-container" id="weapon-'+ index +'">';

            sold = false;
            currentWeapons.forEach(function(currentWeapon) {
                if (currentWeapon.weaponIndex == index) {
                    itemsHtml += '<div class="owned" id="sold_'+ index +'">Owned</div>';
                    sold = true;
                }
            });
            if (sold == false) {
                itemsHtml += '<div class="price" id="sold_'+ index +'">$ '+ weapon.price +'</div>';
            }

            itemsHtml += '<h2>';
            itemsHtml += weapon.name;
            itemsHtml += '</h2>';
            itemsHtml += '<p>'+ weapon.description +'</p>';
            itemsHtml += '</div>';
        });
        $('#all-items').innerHTML = itemsHtml;

        availableWeapons.forEach(function(weapon, index) {
            $('#weapon-'+ index).removeEventListener('click', function() {});
            $('#weapon-'+ index).addEventListener('click', function(e) {
                scene.remove(currentShopBullet);
                e.preventDefault();
                e.stopPropagation();
                thisIndex = this.id.replace(/[^0-9]+/, '');
                var refObject = availableWeapons[thisIndex];
                var material = '';
                if (refObject.texture != null) {
                    material = refObject.texture;
                }
                else if (refObject.texture_ref != null) {
                    material = new THREE.MeshLambertMaterial (
                        {
                            map: gameObjects['texture-' + refObject.texture_ref]
                        }
                    );
                }

                var geometry = '';
                if (refObject.geometry != null) {
                    geometry = refObject.geometry;
                }
                else if(refObject.ref != null) {
                    geometry = gameObjects[refObject.ref].geometry;
                }
                currentShopBullet = new THREE.Mesh(geometry, material);
                currentShopBullet.scale.x *= 5;
                currentShopBullet.scale.y *= 5;
                currentShopBullet.scale.z *= 5;
                scene.add(currentShopBullet);

                buyShopItem(thisIndex);
            }, false);
        });

        // Set scene for shop
        currentShopBullet = '';
        height = Math.round(parseInt($('#shop-item').clientWidth) / 16 * 9);

        for(var i = scene.children.length-1;i>=0;i--){
            scene.remove(scene.children[i]);
        }
        renderer.setSize($('#shop-item').clientWidth, height);
        // Light
        sun = new THREE.SpotLight(0xffffff, 1);
        sun.position.x = 10;
        sun.position.y = 10;
        sun.position.z = 10;
        scene.add(sun);

        AmbientLight = new THREE.AmbientLight(0xcccccc);
        scene.add(AmbientLight);

        camera.position.x = 0;
        camera.position.y = -0.5;
        camera.position.z = 5;

        camera.lookAt(new THREE.Vector3(0,0,0));
        camera.rotation.z = 0;

        $('#shop-canvas').appendChild(renderer.domElement);

        $('#shop-canvas').removeEventListener('click', function(e) {});
        $('#shop-canvas').addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
        });
        shopAnimation();
    });
    return true;
}

/**
 * Display price and buy/sell button for the selected weapon/item
 * @param weaponIndex
 */
function buyShopItem(weaponIndex) {
    buy = true;
    currentWeapons.forEach(function(weapon) {
        if (weapon.weaponIndex == weaponIndex) {
            buy = false;
        }
    });
    if (buy == true) {
        if (availableWeapons[weaponIndex].price <= gameSettings.score) {
            $('#buy-options').innerHTML = '<a id="buy-'+ weaponIndex +'" class="buy">Buy for $ '+ availableWeapons[weaponIndex].price +' now!</a>';
        }
        else {
            $('#buy-options').innerHTML = '<a class="cannot-buy">$ '+ availableWeapons[weaponIndex].price +'</a>';
        }
    }
    else {
        sellPrice = Math.round(availableWeapons[weaponIndex].price * 0.8);
        if (availableWeapons[weaponIndex].sellPrice != null) {
            sellPrice = availableWeapons[weaponIndex].sellPrice;
        }
        $('#buy-options').innerHTML = '<a id="sell-'+ weaponIndex +'"  class="sell">Sell for $ '+ sellPrice +'</a>';
    }
    if ($('#buy-' + weaponIndex) != null) {
        $('#buy-' + weaponIndex).removeEventListener('click', function() {}, false);
        $('#buy-' + weaponIndex).addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            addScore(-parseInt(availableWeapons[weaponIndex].price), true);
            window.localStorage.setItem('gameSettings.score', parseInt(gameSettings.score));
            currentWeapons.push({"weaponIndex": weaponIndex});
            currentWeapons = JSON.stringify(currentWeapons);
            window.localStorage.setItem('gameSettings.currentWeapons', currentWeapons);
            getShop();
        }, false);
    }
    if ($('#sell-' + weaponIndex) != null) {
        $('#sell-' + weaponIndex).removeEventListener('click', function() {}, false);
        $('#sell-' + weaponIndex).addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            sellPrice = Math.round(availableWeapons[weaponIndex].price * 0.8);
            if (availableWeapons[weaponIndex].sellPrice != null) {
                sellPrice = availableWeapons[weaponIndex].sellPrice;
            }
            sellPrice = parseInt(Math.round(sellPrice));
            addScore(sellPrice, true);
            window.localStorage.setItem('gameSettings.score', parseInt(gameSettings.score));
            currentWeapons.forEach(function(weapon, index) {
                if (weapon.weaponIndex == weaponIndex) {
                    delete(currentWeapons[index]);
                }
            });
            newCurrentWeapons = new Array();
            currentWeapons.forEach(function(weapon, index) {
                newCurrentWeapons.push(weapon);
            });
            currentWeapons = JSON.stringify(newCurrentWeapons);
            window.localStorage.setItem('gameSettings.currentWeapons', currentWeapons);
            getShop();
        }, false);
    }
}

function shopAnimation() {
    gameOptions.requestId = requestAnimationFrame(shopAnimation);
    renderer.render(scene, camera);
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