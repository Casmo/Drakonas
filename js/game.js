/**
 * Object with all the game settings. Those are override by the user settings that are stored in indexDB.
 * @type {Object}
 */
var gameSettings = new Object();
gameSettings.availableMissions = [1,2];
gameSettings.unlockedMissions = [0,1];
gameSettings.currentMission = 1;
gameSettings.quality = 'high';
gameSettings.debug = false;
gameSettings.music = true;
gameSettings.effects = true;
gameSettings.controls = 'mouse';

var defaultSounds = [
    {
        "ref": "weapon-default",
        "file": "files/sounds/effects/weapon-default.wav"
    },
    {
        "ref": "explosion-phaser",
        "file": "files/sounds/effects/explosion-phaser.wav"
    }
]

/**
 * Retrieve saved user settings and overrides the gameSettings. Also retrieving scores.
 * @type {Object}
 */
if (window.localStorage) {
    currentMission = window.localStorage.getItem('gameSettings.currentMission');
    if (currentMission != null) {
        gameSettings.currentMission = currentMission;
    }
    quality = window.localStorage.getItem('gameSettings.quality');
    if (quality != null) {
        gameSettings.quality = quality;
    }
    music = window.localStorage.getItem('gameSettings.music')
    if (music != null) {
        gameSettings.music = music;
    }
    effects = window.localStorage.getItem('gameSettings.effects');
    if (effects != null) {
        gameSettings.effects = effects;
    }
    controls = window.localStorage.getItem('gameSettings.controls');
    if (controls != null) {
        gameSettings.controls = controls;
    }
    score = window.localStorage.getItem('gameSettings.score');
    if (score == null) {
        score = 0;
        window.localStorage.setItem('gameSettings.score', score);
    }
    gameSettings.score = score;
    hp = window.localStorage.getItem('gameSettings.hp');
    if (hp == null) {
        hp = 100;
        window.localStorage.setItem('gameSettings.hp', hp);
    }
    gameSettings.hp = hp;
}

/**
 * List with all the objects in the game with it's environments position and callback functions, etc. Will be filled after loading a
 * mission. The key of each object has to be unique and will be filled depending on the .json file in /files/levels/.
 * @type {Object}
 */
var gameObjects                 = new Object();
var scene 					    = new THREE.Scene();
var camera;
var renderer 				    = new THREE.WebGLRenderer({antialias:false});

/**
 * Holds the objects and information about the current mission. Information is loaded from
 * the json file.
 * @type {Array}
 */
var mission                     = new Array();

/**
 * THREE spotlight for creating sunlight in the game. Information comes from the json
 * file.
 */
var sun;
var sunTarget;

/**
 * Global object with options and settings for the game. Like if the player is moving,
 * the game has started, the resolution of the map and browser, etc. Use this object to
 * create new variables that you wanna use in the game.
 * @type {Object}
 */
var gameOptions                 = new Object();
gameOptions.requestId           = 0; // window.requestAnimationFrame id.

/**
 * Array with all the game tweens.
 * @type {Array}
 */
var gameTweens                  = new Array();

var objects                     = new Array();
var objectIndex                 = 0;

/**
 * Array with collidable meshes.
 * Idea from: http://stemkoski.github.io/Three.js/Collision-Detection.html
 */
var destroyableMeshList          = new Array();
var collisionableMeshList          = new Array();

var veryBasicMaterial = new THREE.MeshBasicMaterial({
    color: 0x0000ff
});

/**
 * Function to reset all data and starting a new game.
 */
function newGame() {
    scene 					    = new THREE.Scene();
    camera 					    = new THREE.PerspectiveCamera(45,window.innerWidth / window.innerHeight , 0.1, 870); // 170); // window.innerWidth / window.innerHeight
//    camera                      = new THREE.OrthographicCamera(-60,60, 25, -25, 1, 170 ); // OrthographicCamera( left, right, top, bottom, near, far )
    gameOptions.size            = {x: 120, y: 50, startX: 60, startY: 25 } // StartX: (0 - (gameOptions.size.x / 2))
    gameOptions.buildFor        = {x: window.innerWidth, y: window.innerHeight } // We might need to do something with this. I build this game on a fullscreen resolution of 1920x1080. In some 4:3 situations the player can move out of the screen.
    gameOptions.player          = {delta: 0.06, newPosition: {x: 0, y: 0} }
    gameOptions.move            = false;
    gameOptions.pause           = false;
    gameOptions.inGame          = true;
    gameOptions.playable        = true; // Turn false to prevent player from interacting with game
    gameTweens                  = new Array();
    bullets                     = new Array();
    cancelAnimationFrame(gameOptions.requestId);
}

function playMission(missionCode) {
    newGame();
    mission = missions[missionCode];

    renderer.setSize(window.innerWidth, window.innerHeight);
    if (gameSettings.quality == 'high') {
        renderer.shadowMapEnabled = true;
        //renderer.shadowMapType = THREE.PCFShadowMap; // options are THREE.BasicShadowMap | THREE.PCFShadowMap | THREE.PCFSoftShadowMap

    }
    $('#container').innerHTML = '<div class="pause" id="pause" style="display: none;"></div><div class="overlay" id="overlay"></div><div class="ui" id="ui"></div>';

    ajax('files/content/pause.html', function(data) {
        document.getElementById('pause').innerHTML = data;
        addPauseListeners();
    });

    ajax('files/content/ui.html', function(data) {
        document.getElementById('ui').innerHTML = data;
        setUi();
    });

    $('#container').appendChild(renderer.domElement);

    // @todo Get default menu settings and extend current mission with it (array/object merge)
    if (mission.settings == null) {
        mission.settings = new Object();
    }
    if (mission.settings.sun == null) {
        mission.settings.sun = {
            color: '0xffffff',
            intensity: 1,
            position: {
                x: 0,
                y: 120,
                z: -155
            }
        };
    }
    if (mission.settings.ambientLight != null) {
        AmbientLight = new THREE.AmbientLight(parseInt(mission.settings.ambientLight));
        scene.add(AmbientLight);
    }

    playerMaterial = gameObjects[mission.settings.player.ref].material.map = gameObjects['texture-' + mission.settings.player.texture];
    player = new THREE.Mesh(gameObjects[mission.settings.player.ref].geometry, gameObjects[mission.settings.player.ref].material);
    player.position = mission.settings.player.position;
    player.position.relativeY = 0;

    if (gameSettings.quality == 'high') {
        player.castShadow = true;
    }
    scene.add(player);

    setTimeout(spawnObjects, 250);

    camera.position.x = mission.settings.camera.position.x;
    camera.position.y = mission.settings.camera.position.y;
    camera.position.z = mission.settings.camera.position.z;
    if (gameSettings.debug == true) {
        camera.position.y *= 3;
        mission.settings.gameSpeed *= 3;
    }
    camera.lookAt(new THREE.Vector3(camera.position.x,0,camera.position.z));
    camera.rotation.z = Math.PI;

    // Lights
    environmentLight = new THREE.HemisphereLight(parseInt(mission.settings.environment.sun.color), parseInt(mission.settings.environment.sun.ground), mission.settings.environment.sun.intensity);
    scene.add(environmentLight);
    sunTarget = new THREE.Mesh(new THREE.CubeGeometry(10,10,10), veryBasicMaterial);
    sunTarget.position.x = camera.position.x;
    sunTarget.position.y = -50;
    sunTarget.position.z = camera.position.z;
    sun = new THREE.SpotLight(parseInt(mission.settings.sun.color), mission.settings.sun.intensity );
    sun.position.x = camera.position.x;
    sun.position.y = camera.position.y * 2;
    sun.position.z = camera.position.z;
    sun.target = sunTarget;

    if (gameSettings.quality == 'high') {
        sun.castShadow = true;
        sun.shadowCameraFov = 50;
        sun.shadowBias = 0.0001;
        sun.shadowDarkness = .5;
        sun.shadowMapWidth = window.innerWidth; // Shadow map texture width in pixels.
        sun.shadowMapHeight = window.innerHeight;
    }

    if (mission.settings.environment.fog != null) {
        fog = new THREE.Fog
        scene.fog = new THREE.Fog(parseInt(mission.settings.environment.fog.color), mission.settings.environment.fog.near, mission.settings.environment.fog.far);
    }

    if (gameSettings.debug == true) {
        sun.shadowCameraVisible = true;
    }

    scene.add(sun);

    document.addEventListener("mousemove", onInGameDocumentMouseMove, false);

    setTimeout(function() {
        gameOptions.move = true;
        document.getElementById('overlay').className = 'overlay fadeOut';
    }, 750);

    render(); // Start looping the game
}

function render() {
    if (gameOptions.pause == true) {
        return true;
    }
    gameOptions.requestId = requestAnimationFrame(render);
    if (gameOptions.move == true) {
        camera.position.z += mission.settings.gameSpeed;
    }

    if (gameOptions.playable == true) {
        // Player position. It follows the mouse. Original idea from: http://jsfiddle.net/Gamedevtuts/nkZjR/
        distanceX = gameOptions.player.newPosition.x - player.position.x;
        distance = Math.sqrt(distanceX * distanceX);
        if (distance > 1) {
            movement = (distanceX * gameOptions.player.delta);
            player.position.x += movement;
            rotationMovement = movement * 1.2;
            if (rotationMovement > 1) {
                rotationMovement = 1;
            }
            if (rotationMovement < -1) {
                rotationMovement = -1;
            }
            player.rotation.z = -rotationMovement;
        }

        distanceY = gameOptions.player.newPosition.y - player.position.relativeY;
        distance = Math.sqrt(distanceY * distanceY);
        movement = 0;
        if (distance > 1) {
            movement = (distanceY * gameOptions.player.delta);
            player.position.relativeY += movement;
        }
        player.position.z = camera.position.z + player.position.relativeY; // camera.position.z + player.position.relativeY;
    }
    camera.position.x = player.position.x * 0.90;

    //camera.lookAt(new THREE.Vector3(player.position.x * 0.40,0,camera.position.z+15));

    //sun.position.x = camera.position.x * 0.5;
    //sun.position.y = camera.position.y + 10;
    sun.position.z = camera.position.z;
    sunTarget.position.z = camera.position.z;

    // Collision detection between bullets and objects
    bullets.forEach(function(bullet, index) {
        var originPoint = bullet.position.clone();
        originPoint.y += 10;
        var endPoint = new THREE.Vector3(0,-1,0);
        var ray = new THREE.Raycaster(originPoint, endPoint, 0, 70);
        var collisionResults = ray.intersectObjects(destroyableMeshList);
        if ( collisionResults.length > 0) {
            bulletHit(index, collisionResults[0].object.index);
        }
    });

    if (gameOptions.playable == true) {
        collisionableMeshList.forEach(function(mesh, index) {
            v1 = {x: mesh.position.x, y: mesh.position.y, z: mesh.position.z};
            v2 = player.position;
            distance = calcDistance(v1, v2);
            if (distance < 6) {
                createExplosion(player.position, 4, 8, 28, 0xff0000);
                removeHealth(2);
                removeObjectHp(mesh.missionIndex, 1);
            }
        });
    }

    // Animate game objects
    objects.forEach(function(object, index) {
        missionElement = mission.elements[object.missionIndex];
        if (missionElement.animation != null) {
            // Rotation
            if (missionElement.animation.rotation != null) {
                if (missionElement.animation.rotation.x != null) {
                    objects[index].rotation.x += missionElement.animation.rotation.x;
                }
                if (missionElement.animation.rotation.y != null) {
                    objects[index].rotation.y += missionElement.animation.rotation.y;
                }
                if (missionElement.animation.rotation.z != null) {
                    objects[index].rotation.z += missionElement.animation.rotation.z;
                }
            }
        }
    });

    TWEEN.update();
    renderer.render(scene, camera);
}

function calcDistance (v1, v2) {
    dx = v1.x - v2.x;
    dy = v1.y - v2.y;
    dz = v1.z - v2.z;
    return Math.sqrt(dx*dx+dy*dy+dz*dz);
}

/**
 * Loop through the current objects and spawn objects/monsters that are in the viewport.
 */
function spawnObjects() {
    for (i = 0; i < mission.elements.length; i++) {
        if (mission.elements[i].spawned != null) {
            continue;
        }
        if (mission.elements[i].spawn == null || gameOptions.move == true && mission.elements[i].position.z < (camera.position.z + (gameOptions.size.y / 0.8))
            || (gameSettings.debug == true && mission.elements[i].position.z < (camera.position.z + (gameOptions.size.y * 2)))
            ) {
            mission.elements[i].spawned = true;
            spawnObject(i);
        }
    }
    // This should be higher in combination with the delay on animation of an object.
    if (gameOptions.inGame == true) {
        setTimeout(spawnObjects, 250);
    }
}

/**
 * Spawns an object into the game. Will start the animation directly if the there is one.
 * @param index the index id of the elements in the json file
 */
function spawnObject(index) {
    objectElement = mission.elements[index];
    var refObject = gameObjects[objectElement.ref];
    material = new THREE.MeshBasicMaterial( {color: 0xff9900} );
    var thisIndex = objectIndex;
    if (gameSettings.quality == 'high') {
        material = new THREE.MeshLambertMaterial( {color: 0xff9900} );
    }
    if (objectElement.texture != null && gameObjects['texture-' + objectElement.texture] != null) {
        material = new THREE.MeshLambertMaterial (
            {
                map: gameObjects['texture-' + objectElement.texture]
            }
        );
    }
    var newObject = new THREE.Mesh(refObject.geometry, material);
    newObject.missionIndex = index;
    newObject.stats = objectElement.stats;
    newObject.position = objectElement.position;
    if (gameSettings.quality == 'high') {
        newObject.receiveShadow = true;
        newObject.castShadow = true;
    }
    if (objectElement.collisionable != null && objectElement.collisionable == true) {
        // http://stackoverflow.com/questions/20534042/three-js-raycaster-intersectobjects-only-detects-intersection-on-front-surface
        newObject.material.side = THREE.DoubleSided;
        collisionableMeshList[objectIndex] = newObject;
    }
    // Add the object to the collision array if it is hittable.
    if (objectElement.destroyable != null && objectElement.destroyable == true) {
        // http://stackoverflow.com/questions/20534042/three-js-raycaster-intersectobjects-only-detects-intersection-on-front-surface
        newObject.material.side = THREE.DoubleSided;
        destroyableMeshList[objectIndex] = newObject;
    }

    // Animate the object
    // @todo, might wanna do this when the objects is in the view port.
    if (objectElement.movement != null) {
        delay = 0;
        currentPosition = {i: thisIndex, x: newObject.position.x, y: newObject.position.y, z: newObject.position.z}
        for (var a = 0; a < objectElement.movement.length; a++) {
            animation = objectElement.movement[a];
            easing = TWEEN.Easing.Linear.None;
            if (animation.easing != null) {
                easing = getEasingByString(animation.easing);
            }
            gameTweens['object_' + index + '_' + a] = new TWEEN.Tween( currentPosition )
                .to( { x: animation.x, y: animation.y, z: animation.z }, animation.duration )
                .easing( easing )
                .onUpdate( function () {
                    if (objects[this.i] != null) {
                        objects[this.i].position.x = this.x;
                        objects[this.i].position.y = this.y;
                        objects[this.i].position.z = this.z;
                        if (destroyableMeshList[this.i] != null) {
                            destroyableMeshList[this.i].position.x = this.x;
                            destroyableMeshList[this.i].position.y = this.y;
                            destroyableMeshList[this.i].position.z = this.z;
                        }
                        if (collisionableMeshList[this.i] != null) {
                            collisionableMeshList[this.i].position.x = this.x;
                            collisionableMeshList[this.i].position.y = this.y;
                            collisionableMeshList[this.i].position.z = this.z;
                        }
                    }
                } )
                .onComplete( function () {
                    delete(gameTweens['object_' + index + '_' + a]);
                } )
                .delay(delay)
                .start();
            delay += animation.duration;
            currentPosition = { i: thisIndex, x: animation.x, y: animation.y, z: animation.z }
        }
        if (delay > 0) {
            setTimeout(function() { scene.remove(objects[thisIndex]) }, delay);
        }
    }
    objects[objectIndex] = newObject;
    objects[objectIndex].index = objectIndex;
    scene.add(objects[objectIndex]);

    objectIndex++;
}

/**
 * Logic after loading files/content/ui.html
 */
function setUi() {
    elScore = document.getElementById('score');
    if (elScore != null) {
        elScore.innerHTML = gameSettings.score;
    }
    hp = Math.round(gameSettings.hp);
    document.getElementById('hp').style.height = hp + '%';
}

/**
 * Removes or add health from the player. The health will be saved whether the game has
 * stopped or not.
 * @param health
 */
function removeHealth(health) {
    newHealth = gameSettings.hp - health;
    if (newHealth < 0) {
        newHealth = 0;
        if (gameOptions.inGame == true) {
            gameOver();
        }
    }
    if (newHealth  > 100) {
        newHealth = 100;
    }
    gameSettings.hp = newHealth;
    document.getElementById('hp').style.height = newHealth + '%';
    localStorage.setItem('gameSettings.hp', newHealth);
}

/**
 * Logic after the player is being destroyed.
 */
function gameOver() {
    if (typeof player == 'undefined') {
        return;
    }
    var toPosition = { x: 0, y: 20, z: sunTarget.position.z + 25 }
    gameOptions.playable = false;
    // Animate the player to the ground... :)
    currentPosition = {x: player.position.x, y: player.position.y, z: player.position.z }
    gameTweens['player_gameover'] = new TWEEN.Tween( currentPosition )
        .to( toPosition, 4000 )
        .easing( TWEEN.Easing.Linear.None )
        .onUpdate( function () {
            player.position.x = this.x;
            player.position.y = this.y;
            player.position.z = this.z;
            player.rotation.x -= 0.02;
            player.rotation.y += 0.05;
            player.rotation.z += 0.07;
            randomExplosion = Math.random() * 1000;
            if (randomExplosion < 75) {
                createExplosion({x: this.x, y: this.y, z: this.z}, 5,5,10,0xff0000,500);
            }
        })
        .onComplete( function () {
            delete(gameTweens['player_gameover']);
            createExplosion(toPosition, 40,25,25,0xff0000,2500);
        } )
        .start();
}

/**
 * Converts a string to a TWEEN function
 * @param easing
 * @returns {*}
 * @see http://sole.github.io/tween.js/examples/03_graphs.html
 */
function getEasingByString(easing) {
    switch (easing) {
        case "Quadratic.In":
            easing = TWEEN.Easing.Quadratic.In;
            break;
        case "Quadratic.Out":
            easing = TWEEN.Easing.Quadratic.Out;
            break;
        case "Quadratic.InOut":
            easing = TWEEN.Easing.Quadratic.InOut;
            break;
        case "Cubic.In":
            easing = TWEEN.Easing.Cubic.In;
            break;
        case "Cubic.Out":
            easing = TWEEN.Easing.Cubic.Out;
            break;
        case "Cubic.InOut":
            easing = TWEEN.Easing.Cubic.InOut;
            break;
        case "Quartic.In":
            easing = TWEEN.Easing.Quartic.In;
            break;
        case "Quartic.Out":
            easing = TWEEN.Easing.Quartic.Out;
            break;
        case "Quartic.InOut":
            easing = TWEEN.Easing.Quartic.InOut;
            break;
        case "Quintic.In":
            easing = TWEEN.Easing.Quintic.In;
            break;
        case "Quintic.Out":
            easing = TWEEN.Easing.Quintic.Out;
            break;
        case "Quintic.InOut":
            easing = TWEEN.Easing.Quintic.InOut;
            break;
        case "Sinusoidal.In":
            easing = TWEEN.Easing.Sinusoidal.In;
            break;
        case "Sinusoidal.Out":
            easing = TWEEN.Easing.Sinusoidal.Out;
            break;
        case "Sinusoidal.InOut":
            easing = TWEEN.Easing.Sinusoidal.InOut;
            break;
        case "Exponential.In":
            easing = TWEEN.Easing.Exponential.In;
            break;
        case "Exponential.Out":
            easing = TWEEN.Easing.Exponential.Out;
            break;
        case "Exponential.InOut":
            easing = TWEEN.Easing.Exponential.InOut;
            break;
        case "Circular.In":
            easing = TWEEN.Easing.Circular.In;
            break;
        case "Circular.Out":
            easing = TWEEN.Easing.Circular.Out;
            break;
        case "Circular.InOut":
            easing = TWEEN.Easing.Circular.InOut;
            break;
        case "Elastic.In":
            easing = TWEEN.Easing.Elastic.In;
            break;
        case "Elastic.Out":
            easing = TWEEN.Easing.Elastic.Out;
            break;
        case "Elastic.InOut":
            easing = TWEEN.Easing.Elastic.InOut;
            break;
        case "Back.In":
            easing = TWEEN.Easing.Back.In;
            break;
        case "Back.Out":
            easing = TWEEN.Easing.Back.Out;
            break;
        case "Back.InOut":
            easing = TWEEN.Easing.Back.InOut;
            break;
        case "Bounce.In":
            easing = TWEEN.Easing.Bounce.In;
            break;
        case "Bounce.Out":
            easing = TWEEN.Easing.Bounce.Out;
            break;
        case "Bounce.InOut":
            easing = TWEEN.Easing.Bounce.InOut;
            break;
        default:
            easing = TWEEN.Easing.Linear.None;
    }
    return easing;
}