/**
 * Global controls for better gameplayer experiences. This file handles pausing the game, enable users to switch
 * tabs without losing the game. Enter and exit fullscreen, etc.
 * Check if browser supports locking of mouse cursor.
 * @type {boolean}
 */
var havePointerLock = 'pointerLockElement' in document || 'mozPointerLockElement' in document || 'webkitPointerLockElement' in document;

window.onkeydown = function(e) {
    if (e.keyCode == 27 || e.keyCode == 80) {
        e.preventDefault();
        e.stopPropagation();
        pause();
    }
};
window.onblur = function () {
    pause();
}

function pause() {
    pauseElement = document.getElementById('pause');
    if (pauseElement == null) {
        return true;
    }
    cancelAnimationFrame(gameOptions.requestId);
    document.getElementById('pause').style.display = '';
    for (var key in gameTweens) {
        var obj = gameTweens[key];
        obj.pause();
    }
    gameOptions.pause = true;
    exitPointerLock();
}

function continueGame() {
    if (gameOptions.pause == false) {
        return true;
    }
    var element = document.getElementsByTagName('canvas')[0];
    document.getElementById('pause').style.display = 'none';
    for (var key in gameTweens) {
        var obj = gameTweens[key];
        obj.play();
    }
    gameOptions.pause = false;
    render();
}


// Find the right method, call on correct element
function launchFullscreen() {
    element = document.documentElement;
    if(element.requestFullscreen) {
        element.requestFullscreen();
    } else if(element.mozRequestFullScreen) {
        element.mozRequestFullScreen();
    } else if(element.webkitRequestFullscreen) {
        element.webkitRequestFullscreen();
    } else if(element.msRequestFullscreen) {
        element.msRequestFullscreen();
    }
}

function exitFullscreen() {
    if(document.exitFullscreen) {
        document.exitFullscreen();
    } else if(document.mozCancelFullScreen) {
        document.mozCancelFullScreen();
    } else if(document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
    }
}

/**
 * Disable the mouse from leaving the screens
 * @type {boolean}
 */
function requestPointerLock(element) {
    return element.requestPointerLock || element.mozRequestPointerLock || element.webkitRequestPointerLock;
}

// Ask the browser to release the pointer
function exitPointerLock() {
    document.exitPointerLock = document.exitPointerLock ||
        document.mozExitPointerLock ||
        document.webkitExitPointerLock;
    document.exitPointerLock();
}

/**
 * After loading the pause menu add listeners to the menu items.
 */
function addPauseListeners() {
    if ( havePointerLock ) {
        var pointerlockerror = function ( event ) {
            pause();
        }
        document.addEventListener( 'pointerlockerror', pointerlockerror, false );
        document.addEventListener( 'mozpointerlockerror', pointerlockerror, false );
        document.addEventListener( 'webkitpointerlockerror', pointerlockerror, false );

        document.getElementById('pause').addEventListener( 'click', function ( event ) {
            event.preventDefault();
            event.stopPropagation();
            launchFullscreen();
            element = document.documentElement;
            element.requestPointerLock = element.requestPointerLock || element.mozRequestPointerLock || element.webkitRequestPointerLock;
            element.requestPointerLock();
            return continueGame();
        }, false );
        document.getElementById('continue').addEventListener( 'click', function ( event ) {
            event.preventDefault();
            event.stopPropagation();
            launchFullscreen();
            element = document.documentElement;
            element.requestPointerLock = element.requestPointerLock || element.mozRequestPointerLock || element.webkitRequestPointerLock;
            element.requestPointerLock();
            return continueGame();
        }, false );
        document.getElementById('exit').addEventListener( 'click', function ( event ) {
            event.preventDefault();
            event.stopPropagation();
            return gotoMenu();
        }, false );

    } else {
        document.getElementById('pause').innerHTML = 'Your browser doesn\'t seem to support Pointer Lock API. Please use Mozilla Firefox or Google Chrome.';
    }
}


/**
 * Callback when the player resizes the current browser window.
 */
function onWindowResize() {
    if (camera != null) {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    }
}

/**
 * Calculates the player position ingame depending on the current mouse position
 * @param event
 */
var previousCursorPositionX = 0;
var previousCursorPositionY = 0;
function onInGameDocumentMouseMove( event ) {
    if (gameOptions.inGame == null || gameOptions.inGame == false) {
        return true;
    }
    var movementX = event.movementX || event.mozMovementX || event.webkitMovementX || 0;
    var movementY = event.movementY || event.mozMovementY || event.webkitMovementY || 0;
    positionX = previousCursorPositionX + movementX;
    positionY = previousCursorPositionY + movementY;

    if (positionX < 0) {
        positionX = 0;
    }
    if (positionX > window.innerWidth) {
        positionX = window.innerWidth;
    }
    percentLeft = 100 / gameOptions.buildFor.x * positionX ; // movementX; // @todo fix percent of current resolution
    realLeft = gameOptions.size.startX - (gameOptions.size.x / 100 * percentLeft);
    gameOptions.player.newPosition.x = realLeft;

    if (positionY < 0) {
        positionY = 0;
    }
    if (positionY > window.innerHeight) {
        positionY = window.innerHeight;
    }
    percentTop = 100 / gameOptions.buildFor.y * positionY ; // movementX; // @todo fix percent of current resolution
    realTop = gameOptions.size.startY - (gameOptions.size.y / 100 * percentTop);
    gameOptions.player.newPosition.y = realTop;

    previousCursorPositionY = positionY;
    previousCursorPositionX = positionX;
}