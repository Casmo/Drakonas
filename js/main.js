document.addEventListener('contextmenu', function(e) {
    e.preventDefault();
}, false);


function exit() {
    if (!window.close()) {
        $('#container').innerHTML = '<div class="title text-center">Drakonas</div>';
        $('#container').innerHTML += '<div class="text-center"><p>Thanks for playing! Close the window by pressing "ctrl + w" or "alt + F4".</p><p>Check <a href="http://games.fellicht.nl/">games.fellicht.nl</a> for more amazing games!</p></div>';
    }
}