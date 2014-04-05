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
 * List with all the objects in the game with it's position and callback functions, etc. Will be filled after loading a
 * mission. The key of each object has to be unique and will be filled depending on the .json file in /files/levels/.
 * @type {Object}
 */
var gameObjects             = new Object();
var scene 					= new THREE.Scene();
var camera 					= new THREE.PerspectiveCamera(45,window.innerWidth / window.innerHeight , 1, 570); // 170); // window.innerWidth / window.innerHeight
var renderer 				= new THREE.WebGLRenderer({antialias:true});

var sun;
var gameOptions             = new Object();
gameOptions.requestId       = 0;
/**
 * Array with all the game tweens.
 * @type {Array}
 */
var gameTweens              = new Array();

/**
 * Function to reset all data.
 */
function newGame() {
    scene 					    = new THREE.Scene();
    camera 					    = new THREE.PerspectiveCamera(45,window.innerWidth / window.innerHeight , 1, 370); // 170); // window.innerWidth / window.innerHeight
    gameOptions.size            = {x: 110, y: 50, startX: 55, startY: 25 } // StartX: (0 - (gameOptions.size.x / 2))
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

    var mission = missions[missionCode];
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

    playerMaterial = gameObjects[mission.settings.player.ref].material.map = gameObjects['texture-' + mission.settings.player.reftexture];
    player = new THREE.Mesh(gameObjects[mission.settings.player.ref].geometry, gameObjects[mission.settings.player.ref].material);
    player.position = mission.settings.player.position;
    player.position.relativeY = 0;

    if (gameSettings.quality == 'high') {
        player.castShadow = true;
    }
    scene.add(player);

    for (i = 0; i < mission.elements.length; i++) {
        var refObject = gameObjects[mission.elements[i].ref];
        newObject = new THREE.Mesh(refObject.geometry, defaultMaterial);
        newObject.position = mission.elements[i].position;
        newObject.receiveShadow = true;
        newObject.castShadow = true;
        scene.add(newObject); // @todo texture/color
    }


    camera.rotation.z = 3.145;
    camera.position.x = mission.settings.camera.position.x;
    camera.position.y = mission.settings.camera.position.y;
    camera.position.z = 0;
    camera.lookAt(new THREE.Vector3(0,mission.settings.camera.z,0));
    camera.rotation.z = 3.145;
    gameTweens['camera'] = new TWEEN.Tween( { x: 0, y: 0, z: 0 } )
        .to( { x: mission.settings.camera.position.x, y: mission.settings.camera.position.y, z: mission.settings.camera.position.z }, 3500 )
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
    camera.position.x = player.position.x * 0.25;

    sun.position.x = camera.position.x;
    sun.position.y = camera.position.y + 50;
    sun.position.z = camera.position.z;

    TWEEN.update();

    renderer.render(scene, camera);
}