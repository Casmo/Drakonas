/**
 * Player logic like shooting will be placed in this file.
 */

var bullets             = new Array();
var bulletIndex         = 0;

var explosionIndex      = 0;

function shoot() {
    if (mouseDown == false || gameOptions == null || gameOptions.inGame == null || gameOptions.inGame == false || gameOptions.pause == null || gameOptions.pause == true || gameOptions.playable == false) {
        return;
    }
    var timeNow = new Date().getTime();
    currentWeapons.forEach(function(weapon, index) {
        weaponIndex = parseInt(weapon.weaponIndex);
        if (availableWeapons[weaponIndex].lastShot < (timeNow - availableWeapons[weaponIndex].interval)) {
            spawnBullet(availableWeapons[weaponIndex]);
            availableWeapons[weaponIndex].lastShot = timeNow;
        }
    });

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
    var material = '';
    if (refObject.texture != null) {
        material = refObject.texture;
    }
    else if (refObject.texture_ref != null) {
        material = new THREE.MeshLambertMaterial (
            {
                map: gameObjects['texture-' + refObject.texture_ref]
            }
        );
    }
    var currentIndex = bulletIndex;
    var geometry = '';
    if (refObject.geometry != null) {
        geometry = refObject.geometry;
    }
    else if(refObject.ref != null) {
        geometry = gameObjects[currentWeapon.ref].geometry;
    }
    var bullet = new THREE.Mesh(geometry, material);
    if (currentWeapon.scale != null && currentWeapon.scale.x != null) {
        bullet.scale.x = currentWeapon.scale.x;
    }
    if (currentWeapon.scale != null && currentWeapon.scale.y != null) {
        bullet.scale.y = currentWeapon.scale.y;
    }
    if (currentWeapon.scale != null && currentWeapon.scale.z != null) {
        bullet.scale.z = currentWeapon.scale.z;
    }
    bullet.index = currentIndex;
    bullet.damage = currentWeapon.damage;

    bullet.position.x = player.position.x;
    bullet.position.y = player.position.y;
    bullet.position.z = player.position.z;
    bullet.position.i = currentIndex;
    if (currentWeapon.offset != null) {
        bullet.position.x += currentWeapon.offset.x;
        bullet.position.y += currentWeapon.offset.y;
        bullet.position.z += currentWeapon.offset.z;
    }
    delay = 0;
    position = bullet.position;
    for (var b = 0; b < currentWeapon.animation.length; b++) {
        var toPosition = {x: (position.x + currentWeapon.animation[b].x), i: currentIndex, y: (position.y + currentWeapon.animation[b].y), z: (position.z + currentWeapon.animation[b].z) }
        easing = TWEEN.Easing.Linear.None;
        if (currentWeapon.animation[b].easing != null) {
            easing = getEasingByString(currentWeapon.animation[b].easing);
        }
        var bulletName = 'bullets_' + currentIndex + '_' + b;
        gameTweens[bulletName] = new TWEEN.Tween( position )
            .to( toPosition, currentWeapon.animation[b].duration )
            .easing( easing )
            .onUpdate( function () {
                if (bullets[this.i] != null) {
                    bullets[this.i].position.x = this.x;
                    bullets[this.i].position.y = this.y;
                    bullets[this.i].position.z = this.z;
                }
            } )
            .onComplete( function () {
            } )
            .delay(delay)
            .start();
        position = toPosition;
        delay += currentWeapon.animation[b].duration;
    }
    bullets[currentIndex] = bullet;
    scene.add(bullets[currentIndex]);
    // Play sound
    if (currentWeapon.sound != null && typeof gameObjects[currentWeapon.sound] != null) {
        gameObjects[currentWeapon.sound].play(); // (0);
    }

    setTimeout(function() { removeBullet(currentIndex); }, delay);
    bulletIndex++;
}

function bulletHit(index, objectIndex) {
    // Calculate damage
    // Remove object
    yPos = objects[objectIndex].position.y;
    // Remove bullet from scene, tweens, etc
    removeObjectHp(objectIndex, bullets[index].damage);
    removeBullet(index, true, yPos);
}

function removeObjectHp(objectIndex, damage) {
    if (objects[objectIndex] != null) {
        if (objects[objectIndex] != null && objects[objectIndex].stats != null && objects[objectIndex].stats.hp != null) {
            objects[objectIndex].stats.hp -= damage;
        }
        if (objects[objectIndex].stats.hp == null || objects[objectIndex].stats.hp <= 0) {
            removeObject(objectIndex);
        }
    }
}

function createExplosion(position, size, amount, explosionRatio, color, duration) {
    if (gameSettings.quality != 'high') {
        return;
    }
    if (size == null) {
        size = 2;
    }
    if (amount == null) {
        amount = 5;
    }
    if (explosionRatio == null) {
        explosionRatio = 4;
    }
    if (color == null) {
        color = 0xffffff;
    }
    if (duration == null) {
        duration = 350;
    }
    for (i = 0; i < amount; i++ ) {
        randomObject = Math.round(Math.random() * 3);

        var material = new THREE.MeshBasicMaterial({ color: color });

        if (randomObject == 1) {
            var cubeGeometry = new THREE.CubeGeometry((Math.random() * size) / 10, (Math.random() * size) / 10, (Math.random() * size) / 10);
            var mesh = new THREE.Mesh( circleGeometry, material );
        }
        else if (randomObject == 2) {
            var tertraGeometry = new THREE.TetrahedronGeometry( (Math.random() * size) / 10, 0 );
            var mesh = new THREE.Mesh( tertraGeometry, material );
        }
        else {
            var radius = (Math.random() * size) / 10;
            var segments = 8;
            var circleGeometry = new THREE.CircleGeometry( radius, segments );
            var mesh = new THREE.Mesh( circleGeometry, material );
        }

        mesh.rotation.x = -(Math.PI / 2);
        mesh.position.x = position.x + ((Math.random() * 4) - 2);
        mesh.position.y = position.y + ((Math.random() * 4) - 2);
        mesh.position.z = position.z + ((Math.random() * 4) - 2);
        mesh.position.i = explosionIndex;
        var positionTo = new Object;
        positionTo.x = position.x + (Math.random() * explosionRatio) - (explosionRatio / 2);
        positionTo.y = position.y + (Math.random() * explosionRatio) - (explosionRatio / 2);
        positionTo.z = position.z + (Math.random() * explosionRatio) - (explosionRatio / 2);
        gameTweens['explosion' + explosionIndex] = new TWEEN.Tween( mesh.position )
            .to( positionTo, duration )
            .easing( TWEEN.Easing.Quadratic.Out )
            .onUpdate( function () {
                if (spawnedObjects.game['explosion_' + this.i] != null) {
                    spawnedObjects.game['explosion_' + this.i].position.x = this.x;
                    spawnedObjects.game['explosion_' + this.i].position.y = this.y;
                    spawnedObjects.game['explosion_' + this.i].position.z = this.z;
                    spawnedObjects.game['explosion_' + this.i].scale.x *= 0.96;
                    spawnedObjects.game['explosion_' + this.i].scale.y *= 0.96;
                    spawnedObjects.game['explosion_' + this.i].scale.z *= 0.96;
                }
            } )
            .onComplete( function () {
                delete(gameTweens['explosion' + this.i]);
                scene.remove(spawnedObjects.game['explosion_' + this.i]);
            } )
            .start();
        spawnedObjects.game['explosion_' + explosionIndex] = mesh;
        scene.add(spawnedObjects.game['explosion_' + explosionIndex]);
        explosionIndex++;
    }
}

/**
 * Removes a bullet from the game including its animation
 * @param index
 */
function removeBullet(index, explosion, explosionY) {
    if (bullets[index] != null && explosion != null && explosion == true) {
        createExplosion({x: bullets[index].position.x, y: explosionY, z: bullets[index].position.z});
    }
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
    var bossObject = mission.elements[objectIndex];
    // createExplosion(position, size, amount, explosionSize, color)
    color = 0xff0000;
    if (objects[objectIndex].stats.color != null) {
        color = parseInt(objects[objectIndex].stats.color);
    }
    createExplosion(objects[objectIndex].position, 8, 20, 30, color, 750);
    //gameTweens['bullets_' + index].stop();
    objectElement = mission.elements[object.missionIndex];
    if (objectElement.movement != null) {
        for (var a = 0; a < objectElement.movement.length; a++) {
            delete(gameTweens['object_' + objectIndex + '_' + a]);
        }
    }
    // Add score
    if (objectElement.stats.score != null) {
        addScore(objectElement.stats.score, true);
    }
    scene.remove(objects[objectIndex]);
    delete(objects[objectIndex]);
    if (destroyableMeshList[objectIndex] != null) {
        delete(destroyableMeshList[objectIndex]);
    }
    if (collisionableMeshList[objectIndex] != null) {
        delete(collisionableMeshList[objectIndex]);
    }
    gameObjects['sound-explosion-phaser'].play();
    if (bossObject.boss != null && bossObject.boss == true) {
        gameOver(false);
    }
}

/**
 * Function to add score for the current mission. Player will lose the score if it returns
 * to the menu before finishing the mission. After finishing a mission the score will be
 * add to the normal score and stored in the localStorage.
 * @param score
 */
function addScore(amountToAdd, firstTime) {
    if ($('#score') == null) {
        return false;
    }
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

    if (score > 99999) {
        newScore = currentScore + 100000;
        score -= 100000;
        setTimeout(function () { addScore(score) }, 20);
    }
    else if (score > 9999) {
        newScore = currentScore + 10000;
        score -= 10000;
        setTimeout(function () { addScore(score) }, 20);
    }
    else if (score > 999) {
        newScore = currentScore + 1000;
        score -= 1000;
        setTimeout(function () { addScore(score) }, 20);
    }
    else if (score > 99) {
        newScore = currentScore + 100;
        score -= 100;
        setTimeout(function () { addScore(score) }, 20);
    }
    else if (score > 9) {
        newScore = currentScore + 10;
        score -= 10;
        setTimeout(function () { addScore(score) }, 20);
    }
    else if (score > 0) {
        newScore = currentScore + score;
        //currentScore = $('#score').innerHTML = newScore;
    }
    $('#score').innerHTML = newScore;
}