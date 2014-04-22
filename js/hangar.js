/**
 * Make scene for hanger/menu
 */

controls = new THREE.OrbitControls(camera);
controls.minDistance = 2;
controls.maxDistance = 18;
controls.minPolarAngle = 0.5;
controls.maxPolarAngle = Math.PI / 2.1;

function hangar() {
    cancelAnimationFrame(gameOptions.requestId);
    clearScene();
    gameSettings.score = parseInt(storageGetItem('gameSettings.score', function(value) {gameSettings.score = value;}));
    currentWeapons = storageGetItem('gameSettings.currentWeapons', function(value) { currentWeapons = JSON.parse(value);});
    //currentWeapons = JSON.parse(currentWeapons);

    renderer.setSize(window.innerWidth, window.innerHeight);

    // Light
    // SpotLight(hex, intensity, distance, angle, exponent)
    sun = new THREE.SpotLight(0xffffff,.5);
    sun.position.x = 0;
    sun.position.y = 15;
    sun.position.z = 0;
    if (gameSettings.quality == 'high') {
        sun.castShadow = true;
        sun.shadowCameraFov = 50;
        sun.shadowBias = 0.0001;
        sun.shadowDarkness = .5;
        sun.shadowMapWidth = window.innerWidth / 2; // Shadow map texture width in pixels.
        sun.shadowMapHeight = window.innerHeight / 2;
        sun.shadowCameraNear = 1;
        sun.shadowCameraFar = 60;
    }
    spawnedObjects.hangar['sun'] = sun;
    scene.add(spawnedObjects.hangar['sun']);

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

    // Player
    var refObject = gameObjects['player-hangar'];
    material = new THREE.MeshLambertMaterial({map: gameObjects['texture-player-hangar']});
    geometry = refObject.geometry;
    spawnedObjects.hangar['hangarPlayer'] = new THREE.Mesh(geometry, material);
    spawnedObjects.hangar['hangarPlayer'].rotation.y = -(Math.PI / 2);
    if (gameSettings.quality == 'high') {
        spawnedObjects.hangar['hangarPlayer'].castShadow = true;
    }
    scene.add(spawnedObjects.hangar['hangarPlayer']);

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

    var refObject = gameObjects['hangar-closet'];
    material = new THREE.MeshLambertMaterial({map: gameObjects['texture-hangar-door-frames']});
    spawnedObjects.hangar['closet-1'] = new THREE.Mesh(refObject.geometry, material);
    spawnedObjects.hangar['closet-1'].position = {
        x: -13,
        y: 0,
        z: 11.4
    }
    scene.add(spawnedObjects.hangar['closet-1']);
    spawnedObjects.hangar['closet-2'] = new THREE.Mesh(refObject.geometry, material);
    spawnedObjects.hangar['closet-2'].position = {
        x: -6,
        y: 0,
        z: 11.4
    }
    scene.add(spawnedObjects.hangar['closet-2']);
    spawnedObjects.hangar['closet-3'] = new THREE.Mesh(refObject.geometry, material);
    spawnedObjects.hangar['closet-3'].position = {
        x: 6,
        y: 0,
        z: 11.4
    }
    scene.add(spawnedObjects.hangar['closet-3']);
    spawnedObjects.hangar['closet-4'] = new THREE.Mesh(refObject.geometry, material);
    spawnedObjects.hangar['closet-4'].position = {
        x: 13,
        y: 0,
        z: 11.4
    }
    scene.add(spawnedObjects.hangar['closet-4']);
    spawnedObjects.hangar['closet-5'] = new THREE.Mesh(refObject.geometry, material);
    spawnedObjects.hangar['closet-5'].position = {
        x: -6,
        y: 0,
        z: -11.4
    }
    scene.add(spawnedObjects.hangar['closet-5']);
    spawnedObjects.hangar['closet-6'] = new THREE.Mesh(refObject.geometry, material);
    spawnedObjects.hangar['closet-6'].position = {
        x: 6,
        y: 0,
        z: -11.4
    }
    scene.add(spawnedObjects.hangar['closet-6']);
    spawnedObjects.hangar['closet-7'] = new THREE.Mesh(refObject.geometry, material);
    spawnedObjects.hangar['closet-7'].position = {
        x: 13,
        y: 0,
        z: -11.4
    }
    scene.add(spawnedObjects.hangar['closet-7']);
    spawnedObjects.hangar['closet-8'] = new THREE.Mesh(refObject.geometry, material);
    spawnedObjects.hangar['closet-8'].position = {
        x: -13,
        y: 0,
        z: -11.4
    }
    scene.add(spawnedObjects.hangar['closet-8']);

    // Toolbox and extra stuff
    var refObject = gameObjects['hangar-toolbox-1'];
    material = new THREE.MeshLambertMaterial({map: gameObjects['texture-player-hangar']});
    geometry = refObject.geometry;
    spawnedObjects.hangar['toolbox-1'] = new THREE.Mesh(geometry, material);
    spawnedObjects.hangar['toolbox-1'].position.x = 1;//3;
    spawnedObjects.hangar['toolbox-1'].position.z = 2;//-11;
    spawnedObjects.hangar['toolbox-1'].rotation.y = Math.random() * 10;
    scene.add(spawnedObjects.hangar['toolbox-1']);

    var refObject = gameObjects['hangar-toolbox-2'];
    material = new THREE.MeshLambertMaterial({map: gameObjects['texture-player-hangar']});
    geometry = refObject.geometry;
    spawnedObjects.hangar['toolbox-2'] = new THREE.Mesh(geometry, material);
    spawnedObjects.hangar['toolbox-2'].position.x = -7;
    spawnedObjects.hangar['toolbox-2'].position.z = 12;
    spawnedObjects.hangar['toolbox-2'].rotation.y = Math.random() * 10;
    scene.add(spawnedObjects.hangar['toolbox-2']);

    var refObject = gameObjects['hangar-toolbox-1'];
    material = new THREE.MeshLambertMaterial({map: gameObjects['texture-player-hangar']});
    geometry = refObject.geometry;
    spawnedObjects.hangar['toolbox-3'] = new THREE.Mesh(geometry, material);
    spawnedObjects.hangar['toolbox-3'].position.x = 6;
    spawnedObjects.hangar['toolbox-3'].position.y = 2.9;
    spawnedObjects.hangar['toolbox-3'].position.z = -9.4;
    spawnedObjects.hangar['toolbox-3'].rotation.y = Math.random() * 10;
    scene.add(spawnedObjects.hangar['toolbox-3']);


    geometryFloor = new THREE.PlaneGeometry(42,30);
//    gameObjects['texture-hangar-floor'].wrapS = gameObjects['texture-hangar-floor'].wrapT = THREE.RepeatWrapping;
//    gameObjects['texture-hangar-floor'].repeat.set(3, 3);
    material = new THREE.MeshPhongMaterial(
        {
            map: gameObjects['texture-hangar-floor'],
            color: 0xeeeeee,
            specular:0xcccccc,
            shininess:.5,
            combine: THREE.MixOperation,
            reflectivity: 0.5
        }
    );
    spawnedObjects.hangar['floor'] = new THREE.Mesh(geometryFloor, material);
//    spawnedObjects.hangar['floor'].material.ambient = 0xffffff;
    spawnedObjects.hangar['floor'].rotation.x = -1.57;
    if (gameSettings.quality == 'high') {
        spawnedObjects.hangar['floor'].receiveShadow = true;
    }
    scene.add(spawnedObjects.hangar['floor']);

    camera.lookAt(spawnedObjects.hangar['hangarPlayer'].position);

    hangarAnimation();
}

function hangarAnimation() {
    gameOptions.requestId = requestAnimationFrame(hangarAnimation);
    TWEEN.update();
    renderer.render(scene, camera);
}