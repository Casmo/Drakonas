controls = new THREE.OrbitControls(camera);
/**
 * Display the hanger scene with objects
 */
function hangar() {
    controls.minDistance = 2;
    controls.maxDistance = 12;
    controls.minPolarAngle = 0.01;
    controls.maxPolarAngle = Math.PI / 2.05;

    cancelAnimationFrame(gameOptions.requestId);
    clearScene();
    gameSettings.score = parseInt(storageGetItem('gameSettings.score', function(value) {gameSettings.score = value;}));
    currentWeapons = storageGetItem('gameSettings.currentWeapons', function(value) { currentWeapons = JSON.parse(value);});

    renderer.setSize(window.innerWidth, window.innerHeight);

  // Light above door
    sun = new THREE.SpotLight( 0xffffff, 1, 0, Math.PI / 2, 1 );
    sun.position.x = -28;
    sun.position.y = 11;
    sun.position.z = 0;
    if (gameSettings.quality == 'high') {
        sun.shadowCameraFov = 120;
        sun.castShadow = true;
        sun.shadowMapWidth = 512; // Shadow map texture width in pixels.
        sun.shadowMapHeight = 512;
        sun.shadowCameraNear = .2;
        sun.shadowCameraFar = 100;
        sun.shadowBias = 0.0006;
        sun.shadowDarkness = 0.5;
    }
    spawnedObjects.hangar['sun_light_door'] = sun;
    scene.add(spawnedObjects.hangar['sun_light_door']);

    // Light above the plane
    var light = new THREE.PointLight( 0xffffff,1, 20 );
    light.position.set( 0, 5, 0 );
    scene.add( light );
    spawnedObjects.hangar['sun_light_center'] = light;
    scene.add(spawnedObjects.hangar['sun_light_center']);

    var geometry = new THREE.CylinderGeometry(.2,.2, 4, 8 );
    var material = new THREE.MeshBasicMaterial( {color: 0xcccccc} );
    var cylinder = new THREE.Mesh( geometry, material );
    cylinder.position.x = -19;
    cylinder.position.y = 7;
    cylinder.position.z = 0;
    cylinder.rotation.x = Math.PI / 2;
    spawnedObjects.hangar['light_door'] = cylinder;
    scene.add(spawnedObjects.hangar['light_door']);

    AmbientLight = new THREE.AmbientLight(0x222222);
    spawnedObjects.hangar['AmbientLight'] = AmbientLight;
    scene.add(spawnedObjects.hangar['AmbientLight']);

    camera.position.x = -7;
    camera.position.y = 2;
    camera.position.z = 6;
    camera.rotation.x = 0;
    camera.rotation.y = 0;
    camera.rotation.z = 0;

    $('#background-container').appendChild(renderer.domElement);

    // Player
    var refObject = gameObjects['player-hangar'];
    material = new THREE.MeshPhongMaterial(
      {
          map: gameObjects['texture-player-hangar'],
          shininess:55
      }
    );
    geometry = refObject.geometry;
    geometry.computeVertexNormals();

    spawnedObjects.hangar['player'] = new THREE.Mesh(geometry, material);
    spawnedObjects.hangar['player'].rotation.y = -(Math.PI / 2);
    scene.add(spawnedObjects.hangar['player']);

    // mine
    if (gameSettings.currentMission >= 2) {
        var refObject = gameObjects['enemy-mine'];
        material = new THREE.MeshPhongMaterial(
          {
              map: gameObjects['texture-enemy-mine'],
              normalMap: gameObjects['texture-enemy-mine-normal'],
              shininess: 85
          }
        );
        geometry = refObject.geometry;
        geometry.computeFaceNormals();
        geometry.computeVertexNormals();
        spawnedObjects.hangar['enemy'] = new THREE.Mesh(geometry, material);
        spawnedObjects.hangar['enemy'].position.y = 2.9;
        spawnedObjects.hangar['enemy'].position.x = 6.08;
        spawnedObjects.hangar['enemy'].position.z = 11;
        spawnedObjects.hangar['enemy'].rotation.z = .5;
        spawnedObjects.hangar['enemy'].rotation.y = .8;
        scene.add(spawnedObjects.hangar['enemy']);
        spawnedObjects.hangar['enemy2'] = new THREE.Mesh(geometry, material);
        spawnedObjects.hangar['enemy2'].position.y = 0;
        spawnedObjects.hangar['enemy2'].position.x = 8;
        spawnedObjects.hangar['enemy2'].position.z = -13;
        spawnedObjects.hangar['enemy2'].rotation.z = .5;
        spawnedObjects.hangar['enemy2'].rotation.y = 1.9;
        scene.add(spawnedObjects.hangar['enemy2']);
    }

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
    material = new THREE.MeshLambertMaterial({map: gameObjects['texture-hangar-toolbox']});
    geometry = refObject.geometry;
    spawnedObjects.hangar['toolbox-1'] = new THREE.Mesh(geometry, material);
    spawnedObjects.hangar['toolbox-1'].position.x = 3;
    spawnedObjects.hangar['toolbox-1'].position.z = -11;
    spawnedObjects.hangar['toolbox-1'].rotation.y = Math.random() * 10;
    //scene.add(spawnedObjects.hangar['toolbox-1']);

    var refObject = gameObjects['hangar-toolbox-2'];
    material = new THREE.MeshLambertMaterial({map: gameObjects['texture-hangar-toolbox']});
    geometry = refObject.geometry;
    spawnedObjects.hangar['toolbox-2'] = new THREE.Mesh(geometry, material);
    spawnedObjects.hangar['toolbox-2'].position.x = -7;
    spawnedObjects.hangar['toolbox-2'].position.z = 12;
    spawnedObjects.hangar['toolbox-2'].rotation.y = Math.random() * 10;
    scene.add(spawnedObjects.hangar['toolbox-2']);

    var refObject = gameObjects['hangar-toolbox-1'];
    material = new THREE.MeshLambertMaterial({map: gameObjects['texture-hangar-toolbox']});
    geometry = refObject.geometry;
    spawnedObjects.hangar['toolbox-3'] = new THREE.Mesh(geometry, material);
    spawnedObjects.hangar['toolbox-3'].position.x = 6;
    spawnedObjects.hangar['toolbox-3'].position.y = 2.9;
    spawnedObjects.hangar['toolbox-3'].position.z = -9.4;
    spawnedObjects.hangar['toolbox-3'].rotation.y = Math.random() * 10;
    scene.add(spawnedObjects.hangar['toolbox-3']);

    geometryFloor = new THREE.PlaneGeometry(42,30);
    material = new THREE.MeshPhongMaterial(
        {
            map: gameObjects['texture-hangar-floor'],
            shininess: 55,
            shading: THREE.FlatShading
        }
    );
    spawnedObjects.hangar['floor'] = new THREE.Mesh(geometryFloor, material);
    spawnedObjects.hangar['floor'].rotation.x = -1.57;
    if (gameSettings.quality == 'high') {
        spawnedObjects.hangar['floor'].receiveShadow = true;
        spawnedObjects.hangar['buiding'].receiveShadow = true;
        spawnedObjects.hangar['skelet'].receiveShadow = true;
        spawnedObjects.hangar['door-frames'].receiveShadow = true;
    }
    scene.add(spawnedObjects.hangar['floor']);
    camera.lookAt(spawnedObjects.hangar['player'].position);

    if (gameSettings.quality == 'high') {
        spawnedObjects.hangar['player'].castShadow = true;
        spawnedObjects.hangar['closet-1'].castShadow = true;
        spawnedObjects.hangar['closet-2'].castShadow = true;
        spawnedObjects.hangar['closet-3'].castShadow = true;
        spawnedObjects.hangar['closet-4'].castShadow = true;
        spawnedObjects.hangar['closet-5'].castShadow = true;
        spawnedObjects.hangar['closet-6'].castShadow = true;
        spawnedObjects.hangar['closet-7'].castShadow = true;
        spawnedObjects.hangar['closet-8'].castShadow = true;
        spawnedObjects.hangar['toolbox-1'].castShadow = true;
        spawnedObjects.hangar['toolbox-2'].castShadow = true;
        spawnedObjects.hangar['toolbox-3'].castShadow = true;
    }
    hangarAnimation();
}

function hangarAnimation() {
    gameOptions.requestId = requestAnimationFrame(hangarAnimation);
    TWEEN.update();
    renderer.render(scene, camera);
}