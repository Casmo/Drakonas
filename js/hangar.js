/**
 * Make scene for hanger/menu
 */
var hangarObjects = new Array();

controls = new THREE.OrbitControls(camera);
controls.minDistance = 2;
controls.maxDistance = 35;

function hangar() {
    cancelAnimationFrame(gameOptions.requestId);
    hangarObjects.forEach(function(obj, index) {
        scene.remove(hangarObjects[index]);
    });
    gameSettings.score = parseInt(window.localStorage.getItem('gameSettings.score'));
    currentWeapons = window.localStorage.getItem('gameSettings.currentWeapons');
    currentWeapons = JSON.parse(currentWeapons);
    // Set scene for shop
    currentShopBullet = '';

    for(var i = scene.children.length-1;i>=0;i--){
        scene.remove(scene.children[i]);
    }
    renderer.setSize(window.innerWidth, window.innerHeight);

    // Light
    sun = new THREE.SpotLight(0xffffff, 1);
    sun.position.x = 10;
    sun.position.y = 10;
    sun.position.z = 10;
    scene.add(sun);

    AmbientLight = new THREE.AmbientLight(0xcccccc);
    scene.add(AmbientLight);

    camera.position.x = 12;
    camera.position.y = 2;
    camera.position.z = 9;
    camera.rotation.x = 0;
    camera.rotation.y = 0;
    camera.rotation.z = 0;

    $('#background-container').appendChild(renderer.domElement);

    // Hangar
    var refObject = gameObjects['hangar-skelet'];
    if (refObject.material != null) {
        material = refObject.material;
    }
    else {
        material = new THREE.MeshLambertMaterial ({color: 0xff9900});
    }
    material = new THREE.MeshLambertMaterial ({color: 0xff9900});
    var geometry = '';
    if (refObject.geometry != null) {
        geometry = refObject.geometry;
    }
    else if(refObject.ref != null) {
        geometry = gameObjects[refObject.ref].geometry;
    }
    hangarObjects['skelet'] = new THREE.Mesh(geometry, material);
    scene.add(hangarObjects['skelet']);

    var refObject = gameObjects['hangar-building'];
    if (refObject.material != null) {
        material = refObject.material;
    }
    else {
        material = new THREE.MeshLambertMaterial ({color: 0xcccccc});
    }
    var geometry = '';
    if (refObject.geometry != null) {
        geometry = refObject.geometry;
    }
    else if(refObject.ref != null) {
        geometry = gameObjects[refObject.ref].geometry;
    }
    hangarObjects['buiding'] = new THREE.Mesh(geometry, material);
    scene.add(hangarObjects['buiding']);

    var refObject = gameObjects['hangar-door-frames'];


    material = new THREE.MeshLambertMaterial (
        {
            map: gameObjects['texture-hangar-door-frames']
        }
    );
    var geometry = '';
    if (refObject.geometry != null) {
        geometry = refObject.geometry;
    }
    else if(refObject.ref != null) {
        geometry = gameObjects[refObject.ref].geometry;
    }
    hangarObjects['door-frames'] = new THREE.Mesh(geometry, material);
    scene.add(hangarObjects['door-frames']);

    // Player
    var refObject = gameObjects['player-hangar'];
    material = new THREE.MeshLambertMaterial (
        {
            map: gameObjects['texture-player-hangar']
        }
    );

    var geometry = '';
    if (refObject.geometry != null) {
        geometry = refObject.geometry;
    }
    else if(refObject.ref != null) {
        geometry = gameObjects[refObject.ref].geometry;
    }
    hangarObjects['hangarPlayer'] = new THREE.Mesh(geometry, material);
    hangarObjects['hangarPlayer'].rotation.y = -(Math.PI / 2);

    camera.lookAt(hangarObjects['hangarPlayer'].position);

    scene.add(hangarObjects['hangarPlayer']);

    hangarAnimation();
}

function hangarAnimation() {
    gameOptions.requestId = requestAnimationFrame(hangarAnimation);
    TWEEN.update();
    renderer.render(scene, camera);
}