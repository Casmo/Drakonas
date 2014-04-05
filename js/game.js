/**
 * Object with all the game settings. Those are override by the user settings that are stored in indexDB.
 * @type {Object}
 */
var gameSettings = new Object();
gameSettings.availableMissions = [1,2];
gameSettings.unlockedMissions = [0,1];
gameSettings.currentMission = 1;
gameSettings.quality = 'high';

/**
 * List with all the objects in the game with it'environments position and callback functions, etc. Will be filled after loading a
 * mission. The key of each object has to be unique and will be filled depending on the .json file in /files/levels/.
 * @type {Object}
 */
var gameObjects             = new Object();
var scene 					= new THREE.Scene();
var camera 					= new THREE.PerspectiveCamera(45,window.innerWidth / window.innerHeight , 1, 570); // 170); // window.innerWidth / window.innerHeight
var renderer 				= new THREE.WebGLRenderer({antialias:true});

var mission                 = new Array(); // Holds the current mission

var sun;
var gameOptions             = new Object();
gameOptions.requestId       = 0;
/**
 * Array with all the game tweens.
 * @type {Array}
 */
var gameTweens              = new Array();

/**
 * Function to reset all data and starting a new game.
 */
function newGame() {
    scene 					    = new THREE.Scene();
    camera 					    = new THREE.PerspectiveCamera(45,window.innerWidth / window.innerHeight , 1, 370); // 170); // window.innerWidth / window.innerHeight
    gameOptions.size            = {x: 130, y: 50, startX: 65, startY: 25 } // StartX: (0 - (gameOptions.size.x / 2))
    gameOptions.buildFor        = {x: 1920, y: 1080 }
    gameOptions.player          = {delta: 0.06, newPosition: {x: 0, y: 0} }
    gameOptions.move            = false;
    gameOptions.pause           = false;
    gameOptions.inGame          = true;
    gameTweens                  = new Array();
    cancelAnimationFrame(gameOptions.requestId);
}

function playMission(missionCode) {
    newGame();
    mission = missions[missionCode];
    window.addEventListener('resize', onWindowResize, false);
    renderer.setSize(window.innerWidth, window.innerHeight);
    if (gameSettings.quality == 'high') {
        renderer.shadowMapEnabled = true;
    }
    $('#container').innerHTML = '<div class="pause" id="pause" style="display: none;"></div>';

    ajax('files/content/pause.html', function(data) {
        document.getElementById('pause').innerHTML = data;
        addPauseListeners();
    });
    $('#container').appendChild(renderer.domElement);

    // @todo Get default menu settings and extend current mission with it (array/object merge)
    if (mission.settings == null) {
        mission.settings = new Object();
    }
    if (mission.settings.sun == null) {
        mission.settings.sun = {
            color: 0xffffff,
            position: {
                x: 0,
                y: 120,
                z: 100
            }
        };
    }
    if (mission.settings.ambientLight != null) {
        AmbientLight = new THREE.AmbientLight(mission.settings.ambientLight);
        scene.add(AmbientLight);
    }

    var defaultMaterial = new THREE.MeshBasicMaterial( {color: 0xff9900} );
    if (gameSettings.quality == 'high') {
        defaultMaterial = new THREE.MeshLambertMaterial( {color: 0xff9900} );
    }

    playerMaterial = gameObjects[mission.settings.player.ref].material.map = gameObjects['texture-' + mission.settings.player.texture];
    player = new THREE.Mesh(gameObjects[mission.settings.player.ref].geometry, gameObjects[mission.settings.player.ref].material);
    player.position = mission.settings.player.position;
    player.position.relativeY = 0;

    if (gameSettings.quality == 'high') {
        player.castShadow = true;
    }
    scene.add(player);

    for (i = 0; i < mission.elements.length; i++) {
        spawnObject(i);
    }

    camera.rotation.z = 3.145;
    camera.position.x = mission.settings.camera.position.x;
    camera.position.y = mission.settings.camera.position.y;
    camera.position.z = 0;
    camera.lookAt(new THREE.Vector3(0,mission.settings.camera.z,0));
    camera.rotation.z = 3.145;
    gameTweens['camera'] = new TWEEN.Tween( { x: 0, y: 0, z: 0 } )
        .to( { x: mission.settings.camera.position.x, y: mission.settings.camera.position.y, z: mission.settings.camera.position.z }, 1500 )
        .easing( TWEEN.Easing.Quadratic.InOut )
        .onUpdate( function () {
            camera.position.x = this.x;
            camera.position.y = this.y;
            camera.position.z = this.z;
        } )
        .onComplete( function () {
            gameOptions.move = true;
            delete(gameTweens['camera']);
        } )
        .start();
    sun = new THREE.SpotLight(mission.settings.sun.color);
    sun.position = mission.settings.sun.position;
    sun.intensity = 2;
    if (gameSettings.quality == 'high') {
        sun.castShadow = true;
    }
    sun.target = camera;
    scene.add(sun);

    document.addEventListener("mousemove", onInGameDocumentMouseMove, false);

    render(); // Start looping the game
}

function render() {
    gameOptions.requestId = requestAnimationFrame(render);
    if (gameOptions.pause == true) {
        return true;
    }
    if (gameOptions.move == true) {
        camera.position.z += .15;
    }

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
    player.position.z = camera.position.z + player.position.relativeY;
    camera.position.x = player.position.x * 0.40;

    sun.position.x = camera.position.x;
    sun.position.y = camera.position.y + 50;
    sun.position.z = camera.position.z;

    TWEEN.update();

    renderer.render(scene, camera);
}

/**
 * Spawns an object into the game. Will start the animation directly if the there is one.
 * @param index the index id of the elements in the json file
 */
function spawnObject(index) {
    objectElement = mission.elements[index];
    var refObject = gameObjects[objectElement.ref];
    material = new THREE.MeshBasicMaterial( {color: 0xff9900} );
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
    newObject = new THREE.Mesh(refObject.geometry, material);
    newObject.position = objectElement.position;
    if (gameSettings.quality == 'high') {
        newObject.receiveShadow = true;
        newObject.castShadow = true;
    }

    // Animate the object
    if (objectElement.movement != null) {
        delay = 0;
        currentPosition = {x: newObject.position.x, y: newObject.position.y, z: newObject.position.z}
        for (var a = 0; a < objectElement.movement.length; a++) {
            animation = objectElement.movement[a];
            easing = TWEEN.Easing.Linear.None;
            if (animation.easing != null) {
                switch (animation.easing) {
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
            }
            gameTweens['object_' + index + '_' + a] = new TWEEN.Tween( currentPosition )
                .to( { x: animation.x, y: animation.y, z: animation.z }, animation.duration )
                .easing( easing )
                .onUpdate( function () {
                    newObject.position.x = this.x;
                    newObject.position.y = this.y;
                    newObject.position.z = this.z;
                } )
                .onComplete( function () {
                    delete(gameTweens['object_' + index + '_' + a]);
                } )
                .delay(delay)
                .start();
            delay += animation.duration;
            currentPosition = { x: animation.x, y: animation.y, z: animation.z }
        }
    }
    scene.add(newObject);
}