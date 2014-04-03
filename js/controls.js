/**
 * Check if browser supports locking of mouse cursor.
 * @type {boolean}
 */
var havePointerLock = 'pointerLockElement' in document || 'mozPointerLockElement' in document || 'webkitPointerLockElement' in document;

window.onkeydown = function(e) {
    if (e.keyCode == 27 || e.keyCode == 80) {
        e.preventDefault();
        pause();
    }
};

function pause(force) {
    if (gameOptions.pause == false || (typeof force != 'undefined' && force == true)) {
        document.getElementById('pause').style.lineHeight = window.innerHeight + 'px';
        document.getElementById('pause').style.display = '';
        for (var key in gameTweens) {
            var obj = gameTweens[key];
            obj.pause();
        }
        gameOptions.pause = true;
    }
    else {
        document.getElementById('pause').style.display = 'none';
        for (var key in gameTweens) {
            var obj = gameTweens[key];
            obj.play();
        }
        gameOptions.pause = false;
    }
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
function requestPointerLock() {
    element = document.documentElement;
    return element.requestPointerLock ||
    element.mozRequestPointerLock ||
    element.webkitRequestPointerLock;
}

// Ask the browser to release the pointer
function exitPointerLock() {
    return document.exitPointerLock ||
    document.mozExitPointerLock ||
    document.webkitExitPointerLock;
}