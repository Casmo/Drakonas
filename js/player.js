/**
 * Player logic like shooting will be placed in this file.
 */

var bullets             = new Array();
var bulletIndex         = 0;

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
    "duration":         750,
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
    "duration":         750,
    "offset":           {
        x: -.75,
        y: -.5,
        z: 2
    }
}
currentWeapons[2]       = {
    "geometry":         new THREE.CubeGeometry(.2,.2,.9),
    "texture":          new THREE.MeshBasicMaterial ({color: 0xffffff}),
    "interval":         250,
    "lastShot":         new Date().getTime(),
    "easing":           "Quintic.In",
    "duration":         750,
    "offset":           {
        x: -1.5,
        y: -.5,
        z: 3.7
    }
}
currentWeapons[3]       = {
    "geometry":         new THREE.CubeGeometry(.2,.2,.9),
    "texture":          new THREE.MeshBasicMaterial ({color: 0xffffff}),
    "interval":         250,
    "lastShot":         new Date().getTime(),
    "easing":           "Quintic.In",
    "duration":         750,
    "offset":           {
        x: 0,
        y: -.5,
        z: 3.7
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
}

/**
 * Spawns and animates a bullet.
 * @param currentWeapon
 */
function spawnBullet(currentWeapon) {
    var refObject = currentWeapon;
    var material = refObject.texture;
    var currentIndex = bulletIndex;
    var bullet = new THREE.Mesh(refObject.geometry, material);
    bullet.index = currentIndex;
    bullet.position.x = player.position.x;
    bullet.position.y = player.position.y;
    bullet.position.z = player.position.z;
    bullet.position.i = currentIndex;
    if (currentWeapon.offset != null) {
        bullet.position.x += currentWeapon.offset.x;
        bullet.position.y += currentWeapon.offset.y;
        bullet.position.z += currentWeapon.offset.z;
    }

    var toPosition = {x: bullet.position.x, i: currentIndex, y: bullet.position.y, z: (bullet.position.z + (gameOptions.size.y * 2)) }

    easing = TWEEN.Easing.Linear.None;
    if (currentWeapon.easing != null) {
        easing = getEasingByString(currentWeapon.easing);
    }
    var bulletName = 'bullets_' + currentIndex;
    gameTweens[bulletName] = new TWEEN.Tween( bullet.position )
        .to( toPosition, currentWeapon.duration )
        .easing( easing )
        .onUpdate( function () {
            if (bullets[this.i] != null) {
                bullets[this.i].position.x = this.x;
                bullets[this.i].position.y = this.y;
                bullets[this.i].position.z = this.z;
            }
        } )
        .onComplete( function () {
            removeBullet(this.i);
        } )
        .start();

    bullets[currentIndex] = bullet;
    scene.add(bullets[currentIndex]);
    bulletIndex++;
}

function bulletHit(index, objectIndex) {
    // Calculate damage
    // Remove object
    removeObject(objectIndex);
    // Remove bullet from scene, tweens, etc
    removeBullet(index);
}

/**
 * Removes a bullet from the game including its animation
 * @param index
 */
function removeBullet(index) {
    scene.remove(bullets[index]);
    delete(bullets[index]);
    //gameTweens['bullets_' + index].stop();
    delete(gameTweens['bullets_' + index]);
}

/**
 * Removes a bullet from the game including its animation
 * @param index
 */
function removeObject(objectIndex) {
    object = objects[objectIndex];
    if (object == null) {
        return;
    }
    //gameTweens['bullets_' + index].stop();
    objectElement = mission.elements[object.missionIndex];
    // Todo
    for (var a = 0; a < objectElement.movement.length; a++) {
        delete(gameTweens['object_' + objectIndex + '_' + a]);
    }
    scene.remove(objects[objectIndex]);
    delete(objects[objectIndex]);
}