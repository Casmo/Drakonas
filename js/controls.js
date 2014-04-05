/**
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

function pause() {
    element = document.getElementById('pause');
    if (element == null) {
        return true;
    }
    document.getElementById('pause').style.display = '';
    for (var key in gameTweens) {
        var obj = gameTweens[key];
        obj.pause();
    }
    gameOptions.pause = true;
    exitPointerLock();

    // Cotinue the game
    if ( havePointerLock ) {
        var element = document.getElementsByTagName('canvas')[0];

        var pointerlockerror = function ( event ) {
            pause();
        }

        document.addEventListener( 'pointerlockerror', pointerlockerror, false );
        document.addEventListener( 'mozpointerlockerror', pointerlockerror, false );
        document.addEventListener( 'webkitpointerlockerror', pointerlockerror, false );

        document.getElementById('pause').addEventListener( 'click', function ( event ) {
            event.stopPropagation();
            continueGame();
        }, false );
        document.getElementById('continue').addEventListener( 'click', function ( event ) {
            event.stopPropagation();
            continueGame();
        }, false );
        document.getElementById('exit').addEventListener( 'click', function ( event ) {
            event.stopPropagation();
            gotoMenu();
        }, false );

    } else {
        document.getElementById('pause').innerHTML = 'Your browser doesn\'t seem to support Pointer Lock API. Please use Mozilla Firefox or Google Chrome.';
    }
}

function continueGame() {
    document.getElementById('pause').style.display = 'none';
    element.requestPointerLock = element.requestPointerLock || element.mozRequestPointerLock || element.webkitRequestPointerLock;
    element.requestPointerLock();
    launchFullscreen();
    for (var key in gameTweens) {
        var obj = gameTweens[key];
        obj.play();
    }
    gameOptions.pause = false;
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
 * Callback when the player resizes the current browser window.
 */
function onWindowResize() {
    if (camera != null) {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    }
}