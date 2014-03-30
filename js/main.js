document.addEventListener('contextmenu', function(e) {
    e.preventDefault();
}, false);
window.onkeydown = function(e) {
    if (e.keyCode == 27 /* ESC */) {
        e.preventDefault();
    }
};

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

function exit() {
    if (!window.close()) {
        $('#container').innerHTML = '<div class="title text-center">Drakonas</div>';
        $('#container').innerHTML += '<div class="text-center"><p>Thanks for playing! Close the window by pressing "ctrl + w" or "alt + F4".</p><p>Check <a href="http://games.fellicht.nl/">games.fellicht.nl</a> for more amazing games!</p></div>';
    }
}