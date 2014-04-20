/**
 * Make scene for hanger/menu
 */

controls = new THREE.OrbitControls(camera);
controls.minDistance = 2;
controls.maxDistance = 13;

// @todo refactor.
function hangar() {
    cancelAnimationFrame(gameOptions.requestId);
    clearScene();
    gameSettings.score = parseInt(window.localStorage.getItem('gameSettings.score'));
    currentWeapons = window.localStorage.getItem('gameSettings.currentWeapons');
    currentWeapons = JSON.parse(currentWeapons);

    renderer.setSize(window.innerWidth, window.innerHeight);

    // Light
    sun = new THREE.SpotLight(0xffffff,1);
    sun.position.x = 0;
    sun.position.y = 64;
    sun.position.z = 0;
    sun.castShadow = true;
    sun.shadowMapWidth = 1024;
    sun.shadowMapHeight = 1024;
    sun.shadowCameraNear = 500;
    sun.shadowCameraFar = 4000;
    sun.shadowCameraFov = 30;
    spawnedObjects.hangar['sun'] = sun;
    scene.add(spawnedObjects.hangar['sun']);

    geo = new THREE.CubeGeometry(2,2,2);
    mat = new THREE.MeshBasicMaterial({color: 0xff9900});
    cube = new THREE.Mesh(geo, mat);
    cube.position = sun.position;
    scene.add(cube);

    AmbientLight = new THREE.AmbientLight(0x222222);
    spawnedObjects.hangar['AmbientLight'] = AmbientLight;
    scene.add(spawnedObjects.hangar['AmbientLight']);

    camera.position.x = 12;
    camera.position.y = 2;
    camera.position.z = 9;
    camera.rotation.x = 0;
    camera.rotation.y = 0;
    camera.rotation.z = 0;

    $('#background-container').appendChild(renderer.domElement);

    // Hangar
    var refObject = gameObjects['hangar-skelet'];
    material = new THREE.MeshLambertMaterial (
        {
            map: gameObjects['texture-hangar-skelet']
        }
    );
    if (refObject.geometry != null) {
        geometry = refObject.geometry;
    }
    else if(refObject.ref != null) {
        geometry = gameObjects[refObject.ref].geometry;
    }
    spawnedObjects.hangar['skelet'] = new THREE.Mesh(geometry, material);
    scene.add(spawnedObjects.hangar['skelet']);

    // door
    var refObject = gameObjects['hangar-door-left'];
    geometry = refObject.geometry;
    material = new THREE.MeshLambertMaterial({map: gameObjects['texture-hangar-door']});
    spawnedObjects.hangar['door-left'] = new THREE.Mesh(geometry, material);
    spawnedObjects.hangar['door-left'].position.x = -20.67;
    scene.add(spawnedObjects.hangar['door-left']);

    var refObject = gameObjects['hangar-door-right'];
    material = new THREE.MeshLambertMaterial({map: gameObjects['texture-hangar-door']});
    geometry = refObject.geometry;
    spawnedObjects.hangar['door-right'] = new THREE.Mesh(geometry, material);
    spawnedObjects.hangar['door-right'].position.x = -20.67;
    scene.add(spawnedObjects.hangar['door-right']);

    var refObject = gameObjects['hangar-building'];
    geometry = refObject.geometry;
    material = new THREE.MeshLambertMaterial({map: gameObjects['texture-hangar-building']});
    spawnedObjects.hangar['buiding'] = new THREE.Mesh(geometry, material);
    scene.add(spawnedObjects.hangar['buiding']);

    var refObject = gameObjects['hangar-door-frames'];
    material = new THREE.MeshLambertMaterial({map: gameObjects['texture-hangar-door-frames']});
    geometry = refObject.geometry;
    spawnedObjects.hangar['door-frames'] = new THREE.Mesh(geometry, material);
    scene.add(spawnedObjects.hangar['door-frames']);

    // Player
    var refObject = gameObjects['player-hangar'];
    material = new THREE.MeshLambertMaterial({map: gameObjects['texture-player-hangar']});
    geometry = refObject.geometry;
    spawnedObjects.hangar['hangarPlayer'] = new THREE.Mesh(geometry, material);
    spawnedObjects.hangar['hangarPlayer'].rotation.y = -(Math.PI / 2);
    scene.add(spawnedObjects.hangar['hangarPlayer']);

    camera.lookAt(spawnedObjects.hangar['hangarPlayer'].position);

    hangarAnimation();
}

function hangarAnimation() {
    gameOptions.requestId = requestAnimationFrame(hangarAnimation);
    TWEEN.update();
    renderer.render(scene, camera);
}