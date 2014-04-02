window.onkeydown = function(e) {
    if (e.keyCode == 27 || e.keyCode == 80) {
        e.preventDefault();
        pause();
    }
};

function pause() {
    if (gameOptions.pause == false) {
        for (var key in gameTweens) {
            var obj = gameTweens[key];
            obj.pause();
        }
        gameOptions.pause = true;
    }
    else {
        for (var key in gameTweens) {
            var obj = gameTweens[key];
            obj.play();
        }
        gameOptions.pause = false;
    }
}