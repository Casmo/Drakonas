/**
 * Player logic like shooting will be placed in this file.
 */

var bullets             = new Array();

/**
 * List with current equiped weapons. Intervall is based on time but might need to base it
 * on frames. (Use a counter loop in render() perhaps. Minimum of 50 microseconds.
 * @type {Array}
 */
var currentWeapons      = new Array();
currentWeapons[0]       = {
    "geometry":         new THREE.CubeGeometry(.2,.2,.2),
    "texture":          new THREE.MeshBasicMaterial ({color: 0xffffff}),
    "interval":         50,
    "lastShot":         new Date().getTime(),
    "easing":           "Linear.None",
    "duration":         1000,
    "offset":           {
        x: -.75,
        y: -.5,
        z: 2
    }
}
currentWeapons[1]       = {
    "geometry":         new THREE.CubeGeometry(.2,.2,.8),
    "texture":          new THREE.MeshBasicMaterial ({color: 0xff0000}),
    "interval":         750,
    "lastShot":         new Date().getTime(),
    "easing":           "Linear.None",
    "duration":         1500,
    "offset":           {
        x: -.75,
        y: -.5,
        z: 2
    }
}
function shoot() {
    if (mouseDown == false || gameOptions == null || gameOptions.inGame == null || gameOptions.inGame == false || gameOptions.pause == null || gameOptions.pause == true) {
        return;
    }
    var timeNow = new Date().getTime();
    for (i = 0; i < currentWeapons.length; i++) {
        if (currentWeapons[i].lastShot < (timeNow - currentWeapons[i].interval)) {
            spawnBullet(currentWeapons[i]);
            currentWeapons[i].lastShot = timeNow;
        }
    }

    if (mouseDown == true) {
        setTimeout(function() { shoot(); }, 50);
    }
    // 0. @todo check weapon(s)
    // 1. Check shooting interval
    // 2. Create tween bullet
    // 3. Update shooting interval
}

function spawnBullet(currentWeapon) {
    var bullet;
    bullets.push(bullet);
    var refObject = currentWeapon;
    material = refObject.texture;
    bullets[bullets.length-1] = new THREE.Mesh(refObject.geometry, material);
    bullets[bullets.length-1].position.x = player.position.x;
    bullets[bullets.length-1].position.y = player.position.y;
    bullets[bullets.length-1].position.z = player.position.z;
    bullets[bullets.length-1].position.i = bullets.length-1;
    if (currentWeapon.offset != null) {
        bullets[bullets.length-1].position.x += currentWeapon.offset.x;
        bullets[bullets.length-1].position.y += currentWeapon.offset.y;
        bullets[bullets.length-1].position.z += currentWeapon.offset.z;
    }

    var toPosition = {x:  bullets[bullets.length-1].position.x, y:  bullets[bullets.length-1].position.y, z:  (bullets[bullets.length-1].position.z + (gameOptions.size.y * 2)) }

    easing = TWEEN.Easing.Linear.None;
    if (currentWeapon.easing != null) {
        easing = getEasingByString(currentWeapon.easing);
    }
    var bulletName = 'bullets_' + bullets.length-1;
    gameTweens[bulletName] = new TWEEN.Tween(  bullets[bullets.length-1].position )
        .to( toPosition, currentWeapon.duration )
        .easing( easing )
        .onUpdate( function () {
            bullets[bullets.length-1].position.x = this.x;
            bullets[bullets.length-1].position.y = this.y;
            bullets[bullets.length-1].position.z = this.z;
        } )
        .onComplete( function () {
            delete(gameTweens[bulletName]);
            scene.remove(bullets[this.i]);
        } )
        .start();

    scene.add( bullets[bullets.length-1]);
}