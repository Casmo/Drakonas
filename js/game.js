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
var camera 					= new THREE.PerspectiveCamera(45,window.innerWidth / window.innerHeight , 1, 370); // 170); // window.innerWidth / window.innerHeight
var renderer 				= new THREE.WebGLRenderer({antialias:true});

var sun;
var gameOptions             = new Object();
gameOptions.size            = {x: 200, y: 100, startX: 100 } // StartX: (0 - (gameOptions.size.x / 2))
gameOptions.buildFor        = {x: 1920, y: 1080 }
gameOptions.player          = {delta: 0.06, newPosition: {x: 0, y: 0} }
gameOptions.move            = false;
gameOptions.pause           = true;
/**
 * Array with all the game tweens.
 * @type {Array}
 */
var gameTweens              = new Array();
function playMission(missionCode) {
    window.addEventListener('resize', onWindowResize, false);
    var playerMoving = false;
    var mission = missions[missionCode];
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMapEnabled = true;
    $('#container').innerHTML = '<div class="pause" id="pause">Pause</div>';
    $('#container').appendChild(renderer.domElement);

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


    var defaultMaterial = new THREE.MeshLambertMaterial( {color: 0xff9900} );

    playerMaterial = gameObjects[mission.settings.player.ref].material.map = gameObjects['texture-' + mission.settings.player.reftexture];
    player = new THREE.Mesh(gameObjects[mission.settings.player.ref].geometry, gameObjects[mission.settings.player.ref].material);
    player.position = mission.settings.player.position;
    player.position.relativeX = 0;
    player.position.relativeY = 0;
    player.castShadow = true;
    scene.add(player);

//    for (var key in gameObjects) {
        //var obj = gameObjects[key];
        //console.log(obj);
 //       scene.add(obj);
//    }

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

    if ( havePointerLock ) {
        var element = document.body;
        var pointerlockchange = function ( event ) {
            if ( document.pointerLockElement === element || document.mozPointerLockElement === element || document.webkitPointerLockElement === element ) {
                pause(false);
            } else {
                pause(true);
            }
        }

        var pointerlockerror = function ( event ) {
            pause(true);
        }

        // Hook pointer lock state change events
        document.addEventListener( 'pointerlockchange', pointerlockchange, false );
        document.addEventListener( 'mozpointerlockchange', pointerlockchange, false );
        document.addEventListener( 'webkitpointerlockchange', pointerlockchange, false );

        document.addEventListener( 'pointerlockerror', pointerlockerror, false );
        document.addEventListener( 'mozpointerlockerror', pointerlockerror, false );
        document.addEventListener( 'webkitpointerlockerror', pointerlockerror, false );

        document.addEventListener( 'mousemove', onDocumentMouseMove, false );

        document.getElementById('pause').addEventListener( 'click', function ( event ) {

            document.getElementById('pause').style.display = 'none';
            // Ask the browser to lock the pointer
            element.requestPointerLock = element.requestPointerLock || element.mozRequestPointerLock || element.webkitRequestPointerLock;
            element.requestPointerLock();
        }, false );

    } else {
        document.getElementById('pause').innerHTML = 'Your browser doesn\'t seem to support Pointer Lock API';
    }

    render(); // Start looping the game
}

function render() {
    requestAnimationFrame(render);
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

    player.position.z = camera.position.z;

    sun.position.x = camera.position.x;
    sun.position.y = camera.position.y + 50;
    sun.position.z = camera.position.z;

    TWEEN.update();

    renderer.render(scene, camera);
}

/**
 * Calculates the player position ingame depending on the current mouse position
 * @param event
 */
function onDocumentMouseMove( event ) {
    var movementX = event.movementX || event.mozMovementX || event.webkitMovementX || event.clientX || 0;
    var movementY = event.movementY || event.mozMovementY || event.webkitMovementY || event.clientY || 0;
    event.preventDefault();
    //console.log(movementX);
    percentLeft = 100 / gameOptions.buildFor.x * event.clientX; // movementX; // @todo fix percent of current resolution
    realLeft = gameOptions.size.startX - (gameOptions.size.x / 100 * percentLeft);
    gameOptions.player.newPosition.x = realLeft;
//    player.position.relativeY = 0 - (150 / 2) + mouse.y;

}

/**
 * Callback when the player resizes the current browser window.
 */
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}