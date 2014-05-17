/**
 * List with all the objects in the game with it's environments position and callback functions, etc. Will be filled after loading a
 * mission. The key of each object has to be unique and will be filled depending on the .json file in /files/levels/.
 * @type {Object}
 */
var gameObjects                 = new Object();
var scene = new THREE.Scene();
var renderer = new THREE.WebGLRenderer();
var camera = new THREE.PerspectiveCamera(45,window.innerWidth / window.innerHeight , 0.1, 1170); // 170); // window.innerWidth / window.innerHeight
if (gameSettings.quality == 'high') {
    renderer.shadowMapEnabled = true;
}

/**
 * List with spawned objects for shop, hangar and ingame. We will loop this array before
 * generating a new scene in order to prevent double spawned objects.
 * @type {Object}
 * @see clearScene();
 */
var spawnedObjects = new Object();
spawnedObjects.hangar = new Array();
spawnedObjects.shop = new Array();
spawnedObjects.game = new Array();

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

/**
 * Global object with options and settings for the game. Like if the player is moving,
 * the game has started, the resolution of the map and browser, etc. Use this object to
 * create new variables that you wanna use in the game.
 * @type {Object}
 */
var gameOptions                 = new Object();
gameOptions.requestId           = 0; // window.requestAnimationFrame id.
gameOptions.shopRequestId       = 0;
gameOptions.shootingIntervals   = new Array();

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
    // This is not removing all children that have been spawned.
    clearScene();
    inHangar = false;
    controls.enabled = false;
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);

    gameOptions.size            = {x: 120, y: 50, startX: 60, startY: 25 } // StartX: (0 - (gameOptions.size.x / 2))
    gameOptions.buildFor        = {x: window.innerWidth, y: window.innerHeight } // We might need to do something with this. I build this game on a fullscreen resolution of 1920x1080. In some 4:3 situations the player can move out of the screen.
    gameOptions.player          = {delta: 0.06, newPosition: {x: 0, y: 0} }
    gameOptions.move            = false;
    gameOptions.pause           = false;
    gameOptions.inGame          = true;
    gameOptions.playable        = true; // Turn false to prevent player from interacting with game
    gameSettings.score          = storageGetItem('gameSettings.score');
    gameTweens                  = new Array();
    bullets                     = new Array();
    cancelAnimationFrame(gameOptions.requestId);
}

function playMission(missionCode) {
    newGame();
    mission = missions[missionCode];

    generateTerrain();

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
        mission.settings = {};
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
        spawnedObjects.game['AmbientLight'] = AmbientLight;
        scene.add(spawnedObjects.game['AmbientLight']);
    }

    playerMaterial = gameObjects[mission.settings.player.ref].material.map = gameObjects['texture-' + mission.settings.player.texture];
    gameObjects[mission.settings.player.ref].geometry.computeVertexNormals();
    player = new THREE.Mesh(gameObjects[mission.settings.player.ref].geometry, gameObjects[mission.settings.player.ref].material);
    player.position = mission.settings.player.position;
    player.position.relativeY = 0;

    if (gameSettings.quality == 'high') {
        player.castShadow = true;
    }
    spawnedObjects.game['player'] = player;
    scene.add(spawnedObjects.game['player']);

    if (gameOptions.spawnObjects != null) {
        clearTimeout(gameOptions.spawnObjects);
    }
    gameOptions.spawnObjects = setTimeout(spawnObjects, 250);

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
    spawnedObjects.game['environmentLight'] = environmentLight;
    scene.add(spawnedObjects.game['environmentLight']);
    spawnedObjects.game['sunTarget'] = new THREE.Mesh(new THREE.BoxGeometry(10,10,10), veryBasicMaterial);
    spawnedObjects.game['sunTarget'].position.x = camera.position.x;
    spawnedObjects.game['sunTarget'].position.y = -50;
    spawnedObjects.game['sunTarget'].position.z = camera.position.z;
    sun = new THREE.SpotLight(parseInt(mission.settings.sun.color), mission.settings.sun.intensity );
    sun.position.x = camera.position.x;
    sun.position.y = camera.position.y * 2;
    sun.position.z = camera.position.z;
    sun.target = spawnedObjects.game['sunTarget'];

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
    spawnedObjects.game['sun'] = sun;
    scene.add(spawnedObjects.game['sun']);

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
    spawnedObjects.game['sunTarget'].position.z = camera.position.z;

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
        // @todo Should be fixed by collision detection and not distance calculations.
        collisionableMeshList.forEach(function(mesh, index) {
            v1 = {x: mesh.position.x, y: mesh.position.y, z: mesh.position.z};
            v2 = player.position;
            distance = calcDistance(v1, v2);
            if (distance < 5) {
                createExplosion(player.position, 4, 8, 28, 0xff0000, 350, true);
                removeHealth(2);
                removeObjectHp(mesh.missionIndex, 1);
            }
        });
        enemyBullets.forEach(function(bullet, index) {
            v1 = {x: bullet.x, y: bullet.z};
            v2 = {x: player.position.x, y: player.position.z};
            distance = calcDistance(v1, v2);
            if (distance < 2) {
                createExplosion(bullet, 4, 8, 28, 0xf0ff00);
                removeHealth(1);
                scene.remove(spawnedObjects.game['bullet_enemy_' + index]);
                delete(enemyBullets[index]);
                delete(spawnedObjects.game['bullet_enemy_' + index]);
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
    if (v1.z != null) {
    dz = v1.z - v2.z;
        return Math.sqrt(dx*dx+dy*dy+dz*dz);
    }
    return Math.sqrt(dx*dx+dy*dy);
}

/**
 * Loop through the current objects and spawn objects/monsters that are in the viewport.
 */
function spawnObjects() {
    if (gameOptions.spawnObjects != null) {
        clearTimeout(gameOptions.spawnObjects);
    }
    for (i = 0; i < mission.elements.length; i++) {
        if (mission.elements[i].spawned != null) {
            continue;
        }
        if (mission.elements[i].spawn == null || gameOptions.move == true && mission.elements[i].position.z < (camera.position.z + gameOptions.size.y)
            ) {
            mission.elements[i].spawned = true;
            spawnObject(i);
        }
    }
    // This should be higher in combination with the delay on animation of an object.
    if (gameOptions.inGame == true) {
        gameOptions.spawnObjects = setTimeout(spawnObjects, 250);
    }
}

function Spline() {

    var c = [], v2 = { x: 0, y: 0, z: 0 },
      point, intPoint, weight;

    this.get2DPoint = function ( points, k ) {

        point = ( points.length - 1 ) * k;
        intPoint = Math.floor( point );
        weight = point - intPoint;

        c[ 0 ] = intPoint == 0 ? intPoint : intPoint - 1;
        c[ 1 ] = intPoint;
        c[ 2 ] = intPoint > points.length - 2 ? points.length - 1 : intPoint + 1;
        c[ 3 ] = intPoint > points.length - 3 ? points.length - 1 : intPoint + 2;

        v2.x = interpolate( points[ c[ 0 ] ].x, points[ c[ 1 ] ].x, points[ c[ 2 ] ].x, points[ c[ 3 ] ].x, weight );
        v2.y = interpolate( points[ c[ 0 ] ].y, points[ c[ 1 ] ].y, points[ c[ 2 ] ].y, points[ c[ 3 ] ].y, weight );
        v2.z = interpolate( points[ c[ 0 ] ].z, points[ c[ 1 ] ].z, points[ c[ 2 ] ].z, points[ c[ 3 ] ].z, weight );

        return v2;

    }

    // Catmull-Rom

    function interpolate( p0, p1, p2, p3, t ) {

        var v0 = ( p2 - p0 ) * 0.5;
        var v1 = ( p3 - p1 ) * 0.5;
        var t2 = t * t;
        var t3 = t * t2;
        return ( 2 * p1 - 2 * p2 + v0 + v1 ) * t3 + ( - 3 * p1 + 3 * p2 - 2 * v0 - v1 ) * t2 + v0 * t + p1;

    }

}

/**
 * Spawns an object into the game. Will start the animation directly if the there is one.
 * @param index the index id of the elements in the json file
 */
function spawnObject(index) {
    objectElement = mission.elements[index];
    var refObject = gameObjects[objectElement.ref];
    if (objectElement.smooth != null && objectElement.smooth == true) {
        refObject.geometry.computeVertexNormals();
    }
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
    if (objectElement.size != null) {
        newObject.scale = objectElement.size;
    }
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
    if (objectElement.boss != null && objectElement.boss == true) {
        stopMovement();
    }

    // Animate the object
    // Animation according bezier curving
    if (objectElement.points != null) {
        // Adding the basic start point to the point array of the object
        points = [];
        points.push(objectElement.position);
        for (i = 0; i < objectElement.points.length; i++) {
            points.push(objectElement.points[i]);
        }
        newObject.points = points;
        //mission.elements[objectIndex].points = points;
        dummy = { p: 0, i: thisIndex };
        var spline = new Spline();
        gameTweens['object_' + thisIndex + '_0'] = new TWEEN.Tween( dummy )
          .to( { p: 1 },
          objectElement.points_duration ).easing( TWEEN.Easing.Linear.None ).onUpdate( function() {
          if (objects[this.i] != null) {
              position = spline.get2DPoint( objects[this.i].points, this.p );
              objects[this.i].position.x = position.x;
              objects[this.i].position.y = position.y;
              objects[this.i].position.z = position.z;
              if (destroyableMeshList[this.i] != null) {
                  destroyableMeshList[this.i].position.x = position.x;
                  destroyableMeshList[this.i].position.y = position.y;
                  destroyableMeshList[this.i].position.z = position.z;
              }
              if (collisionableMeshList[this.i] != null) {
                  collisionableMeshList[this.i].position.x = position.x;
                  collisionableMeshList[this.i].position.y = position.y;
                  collisionableMeshList[this.i].position.z = position.z;
              }
          }

        })
      .onComplete( function () {
          delete(gameTweens['object_' + this.i + '_0']);
          removeObject(this.i, false);
      } )
      .start();
    }
    // Moving automaticly to the player. Usefull for mines.
    // @todo there is a bug somehwere here. Making other moving objects using this information.
    else if (objectElement.autoMovement != null) {
        // Auto movement to the player with linear and speed
        toX = (player.position.x - objectElement.position.x) * 2;
        toY = (player.position.y - objectElement.position.y) * 2;
        toZ = (player.position.z - objectElement.position.z) * 2;
        easing = TWEEN.Easing.Linear.None;
        if (objectElement.autoMovement.easing != null) {
            easing = getEasingByString(objectElement.autoMovement.easing);
        }
        currentPosition = {i: thisIndex, x: objectElement.position.x, y: objectElement.position.y, z: objectElement.position.z}
        gameTweens['object_' + thisIndex + '_a'] = new TWEEN.Tween( currentPosition )
            .to( { x: toX, y: toY, z: toZ }, objectElement.autoMovement.speed )
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
                delete(gameTweens['object_' + this.i + '_a']);
                removeObject(this.i, false);
            } )
            .start();
    }
    // Animation according tween.js and easing
    else if (objectElement.movement != null) {
        delay = 0;
        currentPosition = {i: thisIndex, x: newObject.position.x, y: newObject.position.y, z: newObject.position.z}
        for (var a = 0; a < objectElement.movement.length; a++) {
            animation = objectElement.movement[a];
            easing = TWEEN.Easing.Linear.None;
            if (animation.easing != null) {
                easing = getEasingByString(animation.easing);
            }
            delay += animation.duration;
            gameTweens['object_' + index + '_' + a] = new TWEEN.Tween( currentPosition )
                .to( { x: objectElement.movement[a].x, y: objectElement.movement[a].y, z: objectElement.movement[a].z }, animation.duration )
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
                } );
        }

        for (var a = 0; a < objectElement.movement.length; a++) {
            nextA = a + 1;
            var nextChain;
            if (typeof objectElement.movement[nextA] == 'undefined' || objectElement.movement[nextA] == null) {
                if (objectElement.movementRepeat != null && objectElement.movementRepeat == true) {
                    nextChain = gameTweens['object_' + index + '_0'];
                }
            }
            else {
                nextChain = gameTweens['object_' + index + '_' + nextA];
            }
            gameTweens['object_' + index + '_' + a].chain(nextChain);
        }
        gameTweens['object_' + index + '_0'].start();

        // Remove object after the movement
        if (objectElement.movementRepeat == null || objectElement.movementRepeat == false) {
            setTimeout(function(){
                removeObject(index, false);
            }, delay);
        }
    }
    objects[objectIndex] = newObject;
    objects[objectIndex].index = objectIndex;
    spawnedObjects.game['object_' + objectIndex] = objects[objectIndex];

    // Clear and continue with pause
    if (objectElement.shooting != null && objectElement.shooting != '') {
        for (var shootingI = 0; shootingI < objectElement.shooting.length; shootingI++) {
            var shootingObject = objectElement.shooting[shootingI];
            if (shootingObject.timeout != null) {
                setTimeout(function() {
                      if (objects[thisIndex] == null) {
                          return;
                      }
                      spawnEnemyBullet(objects[thisIndex].position, shootingObject, thisIndex);
                  },
                  shootingObject.timeout);
            }
            else if (shootingObject.interval != null) {
                spawnEnemyBullet(objects[thisIndex].position, shootingObject, thisIndex);
            }
        }
    }

    scene.add(spawnedObjects.game['object_' + objectIndex]);
    objectIndex++;
}
var enemyBulletIndex = 0;
var enemyBullets = new Array();
function spawnEnemyBullet(position, bulletObject, objectIndex) {
    if (objects[objectIndex] == null) {
        return false;
    }
    var refObject = bulletObject;
    var material = new THREE.MeshBasicMaterial({color: 0xf0ff00});
    if (refObject.ref != null) {
        geometry = gameObjects[refObject.ref];
    }
    else {
      return false;
    }

    var bullet = new THREE.Mesh(geometry, material);
    bullet.position.x = position.x;
    bullet.position.y = position.y;
    bullet.position.z = position.z;

    if (bulletObject.offset != null) {
        if (bulletObject.offset.x != null) {
            bullet.position.x += bulletObject.offset.x;
        }
        if (bulletObject.offset.y != null) {
            bullet.position.y += bulletObject.offset.y;
        }
        if (bulletObject.offset.z != null) {
            bullet.position.z += bulletObject.offset.z;
        }
    }

    easing = TWEEN.Easing.Linear.None;
    if (bulletObject.easing != null) {
        easing = getEasingByString(bulletObject.easing);
    }
    var bulletIndex = enemyBulletIndex;
    if (bulletObject.direction == 'down') {
        gameTweens['bullet_enemy_' + enemyBulletIndex] = new TWEEN.Tween( {x: bullet.position.x, y: bullet.position.y, z: bullet.position.z, i: bulletIndex }  )
            .to( { x:  bullet.position.x, y:  bullet.position.y, z: (bullet.position.z - 50), i: bulletIndex }, bulletObject.speed )
            .easing( easing )
            .onUpdate( function () {
                if (spawnedObjects.game['bullet_enemy_' + this.i] != null) {
                    spawnedObjects.game['bullet_enemy_' + this.i].position.x = this.x;
                    spawnedObjects.game['bullet_enemy_' + this.i].position.y = this.y;
                    spawnedObjects.game['bullet_enemy_' + this.i].position.z = this.z;
                    enemyBullets[bulletIndex].x = this.x;
                    enemyBullets[bulletIndex].y = this.y;
                    enemyBullets[bulletIndex].z = this.z;

                }
            } )
            .onComplete( function () {
                delete(gameTweens['bullet_enemy_' + bulletIndex]);
                scene.remove(spawnedObjects.game['bullet_enemy_' + bulletIndex]);
                delete(enemyBullets[bulletIndex]);
            } )
            .start();
    }

    spawnedObjects.game['bullet_enemy_' + enemyBulletIndex] = bullet;
    enemyBullets[bulletIndex] = new Object();
    enemyBullets[bulletIndex].x = 0;
    enemyBullets[bulletIndex].y = 0;
    enemyBullets[bulletIndex].z = 0;
    scene.add(spawnedObjects.game['bullet_enemy_' + enemyBulletIndex]);
    enemyBulletIndex++;

    if (refObject.interval != null) {
        setTimeout(function(){
            spawnEnemyBullet(position, bulletObject, objectIndex);
        }, refObject.interval);
    }
}

/**
 * Logic after loading files/content/ui.html
 */
function setUi() {
    $('#score').innerHTML = gameSettings.score;
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
            gameOver(true);
        }
    }
    if (newHealth  > 100) {
        newHealth = 100;
    }
    gameSettings.hp = newHealth;
    document.getElementById('hp').style.height = newHealth + '%';
    storageSetItem('gameSettings.hp', newHealth);
}

/**
 * Function to add score for the current mission. Player will lose the score if it returns
 * to the menu before finishing the mission. After finishing a mission the score will be
 * add to the normal score and stored in the localStorage.
 * @param amountToAdd total amount the add
 * @param firstTime boolean for checking recurring loop of money
 */
function addScore(amountToAdd, firstTime) {
    scoreEl = $('#score');
    if (scoreEl == null) {
        return false;
    }
    // Amount could be negative. For example in the shop.
    if (amountToAdd <= 0) {
        gameSettings.score = parseInt(gameSettings.score) + amountToAdd;
        $('#score').innerHTML = gameSettings.score;
        return true;
    }
    score = parseInt(amountToAdd);
    currentScore = parseInt(gameSettings.score);
    newScore = currentScore + score;
    if (typeof firstTime != 'undefined' && firstTime == true) {
        gameSettings.score = parseInt(gameSettings.score) + score;
    }
    s = 100000;
    while (s > 9) {
        if (amountToAdd >= s) {
            newScore = currentScore + s;
            score -= s;
            setTimeout(function () { addScore(score) }, 20);
            break;
        }
        s /= 10;
    }
    if (s > 0) {
        newScore = currentScore + score;
    }
    scoreEl.innerHTML = newScore;
    return true;
}

/**
 * Logic after the player is being destroyed.
 */
function gameOver(playerDied) {
    if (typeof player == 'undefined') {
        return;
    }
    storageSetItem('gameSettings.score', gameSettings.score);
    currentPosition = {x: player.position.x, y: player.position.y, z: player.position.z }
    gameOptions.playable = false;
    if (playerDied == true) {
        gameObjects['sound-dieing-player'].play();
        var toPosition = { x: 0, y: 15, z: spawnedObjects.game['sunTarget'].position.z + 25 }
        // Animate the player to the ground... :)
        gameTweens['player_gameover'] = new TWEEN.Tween( currentPosition )
            .to( toPosition, 2700 )
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
                createExplosion(toPosition, 40,25,25,0xff0000,2500, true);
                delete(gameTweens['player_gameover']);
                gameObjects['sound-explosion-phaser'].play();
                setTimeout(function() {stopMovement();}, 10000); // Some objects might have been spawned and should leave the screen.
            } )
            .start();
    }
    else {
        // Enable next mission
        var unlockedMissions = storageGetItem('gameSettings.unlockedMissions');
        unlockedMissions = JSON.parse(unlockedMissions);
        gameSettings.unlockedMissions = unlockedMissions;
        unlockedMissions.push(gameSettings.currentMission);
        unlockedMissions = JSON.stringify(unlockedMissions);
        storageSetItem('gameSettings.unlockedMissions', unlockedMissions);
        gameSettings.currentMission++;
        storageSetItem('gameSettings.currentMission', gameSettings.currentMission);

        if (gameOptions.move == true) {
            stopMovement();
        }
        // Game ended with defeating boss. Let's make a salto
        currentPosition.r = player.rotation.x;
        currentPosition.rz = player.rotation.z;
        toPosition = {x: 0, y: 40, z: (spawnedObjects.game['sunTarget'].position.z - 10), r: 0, rz: 0 }
        gameTweens['player_salto_0'] = new TWEEN.Tween( currentPosition )
          .to( toPosition, 1500 )
          .easing( TWEEN.Easing.Quadratic.Out )
          .onUpdate( function () {
              player.position.x = this.x;
              player.position.y = this.y;
              player.position.z = this.z;
              player.rotation.x = this.r;
              player.rotation.z = this.rz;
          })
          .onComplete( function () {
              delete(gameTweens['player_salto_0']);
          } )
          .start();
        currentPosition = {x: toPosition.x, y: 40, z: toPosition.z, r: 0, rz: 0 };
        toPosition = {x: toPosition.x, y: 70, z: (toPosition.z + 32), r: -1.57, rz: -1.57 }
        gameTweens['player_salto_1'] = new TWEEN.Tween( currentPosition )
          .to( toPosition, 1000 )
          .easing( TWEEN.Easing.Quadratic.Out )
          .onUpdate( function () {
              player.position.x = this.x;
              player.position.y = this.y;
              player.position.z = this.z;
              player.rotation.x = this.r;
              player.rotation.z = this.rz;
          })
          .onComplete( function () {
              delete(gameTweens['player_salto_1']);
          } )
          .delay(1500)
          .start();
        currentPosition = {x: toPosition.x, y: 70, z: toPosition.z, r: -1.57, rz: -1.57 };
        toPosition = { x: currentPosition.x, y: 90, z: (currentPosition.z - 10), r: -3.14, rz: -3.14}
        gameTweens['player_salto_2'] = new TWEEN.Tween( currentPosition )
          .to( toPosition, 1000 )
          .easing( TWEEN.Easing.Quadratic.In )
          .onUpdate( function () {
              player.position.x = this.x;
              player.position.y = this.y;
              player.position.z = this.z;
              player.rotation.x = this.r;
              player.rotation.z = this.rz;
          })
          .onComplete( function () {
              delete(gameTweens['player_salto_2']);
          } )
          .delay(2500)
          .start();
        currentPosition = {x: currentPosition.x, y: 90, z: (currentPosition.z - 10), r: -3.14, rz: -3.14};
        toPosition = { x: currentPosition.x, y: 90, z: (currentPosition.z - 50), r: -3.14, rz: -3.14}
        gameTweens['player_salto_3'] = new TWEEN.Tween( currentPosition )
          .to( toPosition, 1000 )
          .easing( TWEEN.Easing.Linear.None )
          .onUpdate( function () {
              player.position.x = this.x;
              player.position.y = this.y;
              player.position.z = this.z;
              player.rotation.x = this.r;
              player.rotation.z = this.rz;
          })
          .onComplete( function () {
              delete(gameTweens['player_salto_3']);
          } )
          .delay(3500)
          .start();
        setTimeout(function() {gotoMenu();}, 6000); // Some objects might have been spawned and should leave the screen.
    }
}

function stopMovement() {
    gameOptions.move = false;
    cameraFrom = {z: camera.position.z}
    cameraTo = {z: camera.position.z + 35}
    gameTweens['cameraMovement'] = new TWEEN.Tween( cameraFrom )
      .to( cameraTo, 5500 )
      .easing( TWEEN.Easing.Quadratic.Out )
      .onUpdate( function () {
          camera.position.z = this.z;
      })
      .onComplete( function () {
          delete(gameTweens['cameraMovement']);
      } )
      .start();
}

/**
 * clears a scene from objects that have been spawned (added) before..
 */
function clearScene() {
    for (var key in spawnedObjects.hangar) {
        var obj = spawnedObjects.hangar[key];
        scene.remove(obj);
    }
    for (var key in spawnedObjects.shop) {
        var obj = spawnedObjects.shop[key];
        scene.remove(obj);
    }
    for (var key in spawnedObjects.game) {
        var obj = spawnedObjects.game[key];
        scene.remove(obj);
    }
}

function generateTerrain() {
    worldWidth = 40;
    worldDepth = 360;
    data = generateHeight( worldWidth, worldDepth );
    var geometry = new THREE.PlaneGeometry( 300, 3200, worldWidth - 1, worldDepth - 1 );
    geometry.applyMatrix( new THREE.Matrix4().makeRotationX( - Math.PI / 2 ) );
    for ( var i = 0, l = geometry.vertices.length; i < l; i ++ ) {
        geometry.vertices[ i ].y = data[ i ] * 1.5;
    }
    texture = new THREE.Texture( generateTexture( data, worldWidth, worldDepth ), new THREE.UVMapping(), THREE.ClampToEdgeWrapping, THREE.ClampToEdgeWrapping );
    texture.needsUpdate = true;
    spawnedObjects.game['terrain'] = new THREE.Mesh( geometry, new THREE.MeshBasicMaterial( { map: texture } ) );
    scene.add( spawnedObjects.game['terrain'] );
    spawnedObjects.game['terrain'].position.z = 1500; // height;
    if (gameSettings.quality == 'high') {
        spawnedObjects.game['terrain'].receiveShadow = true;
    }
    renderer.setClearColor( 0xbfd1e5 );

}

function generateHeight( width, height ) {

    var size = width * height, data = new Uint8Array( size ),
      perlin = new ImprovedNoise(), quality = 1, z = Math.random() * 2;

    for ( var j = 0; j < 4; j ++ ) {

        for ( var i = 0; i < size; i ++ ) {

            var x = i % width, y = ~~ ( i / width );
            data[ i ] += Math.abs( perlin.noise( x / quality, y / quality, z ) * quality * 1.11 );

        }

        quality *= 2.22;

    }

    return data;

}

function generateTexture( data, width, height ) {

    var canvas, canvasScaled, context, image, imageData,
      level, diff, vector3, sun, shade;

    vector3 = new THREE.Vector3( 0, 0, 0 );

    sun = new THREE.Vector3( 1, 1, 1 );
    sun.normalize();

    canvas = document.createElement( 'canvas' );
    canvas.width = width;
    canvas.height = height;

    context = canvas.getContext( '2d' );
    context.fillStyle = '#000';
    context.fillRect( 0, 0, width, height );

    image = context.getImageData( 0, 0, canvas.width, canvas.height );
    imageData = image.data;

    for ( var i = 0, j = 0, l = imageData.length; i < l; i += 4, j ++ ) {

        vector3.x = data[ j - 2 ] - data[ j + 2 ];
        vector3.y = 2;
        vector3.z = data[ j - width * 2 ] - data[ j + width * 2 ];
        vector3.normalize();

        shade = vector3.dot( sun );

        imageData[ i ] = ( 96 + shade * 128 ) * ( 0.5 + data[ j ] * 0.007 );
        imageData[ i + 1 ] = ( 32 + shade * 96 ) * ( 0.5 + data[ j ] * 0.007 );
        imageData[ i + 2 ] = ( shade * 96 ) * ( 0.5 + data[ j ] * 0.007 );
    }

    context.putImageData( image, 0, 0 );

    // Scaled 4x

    canvasScaled = document.createElement( 'canvas' );
    canvasScaled.width = width * 4;
    canvasScaled.height = height * 4;

    context = canvasScaled.getContext( '2d' );
    context.scale( 4, 4 );
    context.drawImage( canvas, 0, 0 );

    image = context.getImageData( 0, 0, canvasScaled.width, canvasScaled.height );
    imageData = image.data;

    for ( var i = 0, l = imageData.length; i < l; i += 4 ) {

        var v = ~~ ( Math.random() * 5 );

        imageData[ i ] += v;
        imageData[ i + 1 ] += v;
        imageData[ i + 2 ] += v;

    }

    context.putImageData( image, 0, 0 );

    return canvasScaled;

}

/**
 * Converts a string to a TWEEN function
 * @param easing
 * @returns {*}
 * @see http://sole.github.io/tween.js/examples/03_graphs.html
 */
function getEasingByString(easing) {
    return TWEEN.Easing[easing.split('.')[0]][easing.split('.')[1]];
}