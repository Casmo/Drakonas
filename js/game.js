/**
 * Object with all the game settings. Those are override by the user settings that are stored in indexDB.
 * @type {Object}
 */
var gameSettings = new Object();
gameSettings.availableMissions = [1,2];
gameSettings.unlockedMissions = [0,1];
gameSettings.currentMission = 1;

/**
 * List with all the objects in the game with it's position and callback functions, etc. Will be filled after loading a
 * mission. The key of each object has to be unique and will be filled depending on the .json file in /files/levels/.
 * @type {Object}
 */
var gameObjects             = new Object();
var scene 					= new THREE.Scene();
var camera 					= new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 2000); // 170);
var renderer 				= new THREE.WebGLRenderer({antialias:true});



function render() {
    camera.position.x += 0.15;
//    player.position.z = camera.position.z + player.position.relativeX; // basis position
//    player.position.x = camera.position.x - player.position.relativeY + (settings.camera - 4); //  is the size of the player
//    sun.position.x = camera.position.x;
//    sun.position.y = camera.position.y + 50;
//    sun.position.z = camera.position.z;
    requestAnimationFrame(render);
    renderer.render(scene, camera);
}