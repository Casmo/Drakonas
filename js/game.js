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
var camera 					= new THREE.PerspectiveCamera(45, 1.7777777777777777777777777777778 , 1, 370); // 170); // window.innerWidth / window.innerHeight
var renderer 				= new THREE.WebGLRenderer({antialias:true});
var gameOptions             = new Object();
gameOptions.size            = {x: 200, y: 100 } // game view port
gameOptions.buildFor        = {x: 1920, y: 1080 }
gameOptions.move            = false;
gameOptions.pause           = false;
var gameTweens              = new Array();
function playMission(missionCode) {

    var playerMoving = false;
    var mission = missions[missionCode];
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMapEnabled = true;
    $('#container').innerHTML = '';
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

    sun = new THREE.SpotLight(mission.settings.sun.color);
    sun.position = mission.settings.sun.position;
    sun.intensity = 2;
    if (gameSettings.quality == 'high') {
        sun.castShadow = true;
    }
    scene.add(sun);


    var material = new THREE.MeshLambertMaterial( {color: 0xff9900} );
    player = new THREE.Mesh(gameObjects[mission.settings.player.ref].geometry, material);
    player.position = mission.settings.player.position;
    player.position.relativeX = 0;
    player.position.relativeY = 0;
    console.log(player.position);
    scene.add(player);


//    sun.shadowCameraVisible = false;
//    sun.shadowDarkness = 0.1;
//    sun.intensity = 2;
//    sun.shadowCameraFov = 150;
//    sun.castShadow = true;
//    sun.target = camera;
//    for (var key in gameObjects) {
        //var obj = gameObjects[key];
        //console.log(obj);
 //       scene.add(obj);
//    }

    var material = new THREE.MeshLambertMaterial( {color: 0x8888ff} );
    for (i = 0; i < mission.elements.length; i++) {
        var refObject = gameObjects[mission.elements[i].ref];
        newObject = new THREE.Mesh(refObject.geometry, material);
        newObject.position = mission.elements[i].position;
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
    renderer.domElement.addEventListener( 'mousemove', onDocumentMouseMove, false );
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
    player.position.z = camera.position.z;
    player.position.x = 0 - (gameOptions.size.x / 2) + player.position.relativeX; // basis position
    //player.position.x = camera.position.x - player.position.relativeY; //  is the size of the player
    sun.position.x = camera.position.x;
    sun.position.y = camera.position.y + 50;
    sun.position.z = camera.position.z;

    TWEEN.update();

    renderer.render(scene, camera);
}

gameOptions.size            = {x: 200, y: 100 }
gameOptions.buildFor        = {x: 1920, y: 1080 }
gameOptions.realSize        = {x: gameOptions.size.x / 200 }
function onDocumentMouseMove( event ) {
    event.preventDefault();
    percentLeft = 100 / gameOptions.buildFor.x * event.clientX;
    realLeft = gameOptions.realSize.x * percentLeft;
    player.position.relativeX = realLeft;
//    player.position.relativeY = 0 - (150 / 2) + mouse.y;

}