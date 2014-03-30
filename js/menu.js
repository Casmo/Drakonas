if ( document.addEventListener ) {
    // Use the handy event callback
    document.addEventListener( "DOMContentLoaded", function(){
        document.removeEventListener( "DOMContentLoaded", arguments.callee, false );
        gotoMenu();
    }, false );
}
var menuHtml = '';
function gotoMenu() {
    $('#container').className = 'animated fadeOut';
    loadingManager.totalObjects = 1;
    loadingManager.loadedCallback = showMenu;
    ajax('files/content/menu.html', function(data) {
        menuHtml = data;
        loadingManager.objectLoaded();
    });
}

function showMenu() {
    $('#container').className = 'background-menu animated fadeIn';
    $('#container').innerHTML = menuHtml;

    // Menu items
    document.body.addEventListener('click', function(event) {
        hideInfoWindows();
    });
    infoWindows = document.getElementsByClassName('info-window');
    for (i = 0; i < infoWindows.length; i++) {
        // Do not fire normal clicks on this div
        infoWindows[i].addEventListener('click', function(event) {
            event.stopPropagation();
        });
        linkId = infoWindows[i].id.replace(/window-/, '');
        document.getElementById(linkId).addEventListener('click', function(event) {
            linkId = this.id;
            event.stopPropagation();
            hideInfoWindows();
            document.getElementById('window-' + linkId).className = 'info-window animated fadeIn';
        });
    }

    document.getElementById('start').addEventListener('click', function() {
        //launchFullscreen();
        gotoMissions();
    });

    document.getElementById('exit').addEventListener('click', function() {
        exit();
    });
}

/**
 * Get current available missions
 */
var missionHtml;
var missions = new Array();
function gotoMissions() {
    $('#container').className = 'animated fadeOut';
    missions = new Array();
    loadingManager.totalObjects = gameSettings.availableMissions.length + 1;
    loadingManager.loadedCallback = showMissions;
    for (i = 1; i <= gameSettings.availableMissions.length; i++) {
        ajax('files/levels/'+ i +'.json', function(data) {
            data = JSON.parse(data);
            missions[data.code] = data;
            loadingManager.objectLoaded();
        });
    }
    ajax('files/content/missions.html', function(data) {
        missionHtml = data;
        loadingManager.objectLoaded();
    })
}

function showMissions() {
    $('#container').innerHTML = missionHtml;
    missions.forEach(function(mission, i) {
        if (typeof gameSettings.unlockedMissions[i] != 'undefined') {
            link = '<a id="mission_'+ i +'">'+ mission.name +'</a>';
        }
        else {
            link = '<a class="disabled">'+ mission.name +'</a>';
        }
        $('#missions').innerHTML = $('#missions').innerHTML + link;
    });

    missions.forEach(function(mission, i) {
        if (typeof gameSettings.unlockedMissions[i] != 'undefined') {
            $('#mission_'+ i).addEventListener('click', function() {
                loadMission(i);
            });
        }
    });

    $('#menu').addEventListener('click', function() {
        gotoMenu();
    });

    $('#container').className = 'background-mission animated fadeIn';
}

// Loads all objects and textures for the selected mission and stats the mission after.
function loadMission(missionCode) {
    gameObjects = new Object();
    manager = new THREE.LoadingManager();
    $('#container').innerHTML = 'Loading mission ' + missionCode;
    loadingManager.totalObjects = 0;
    loadingManager.loadedCallback = function() { playMission(missionCode); }
    missions[missionCode].objects.forEach(function(object, i) {
        if (object.file != null) {
            loadingManager.totalObjects++;
            gameObjects[object.ref] = new Object();
            // load file
            loader = new THREE.OBJLoader(manager);
            loader.load(object.file, function (object) {
                gameObjects[object.ref] = object;
                loadingManager.objectLoaded();
            });
        }
    });
    missions[missionCode].textures.forEach(function(texture, i) {
        if (texture.file != null) {
            loadingManager.totalObjects++;
            // load file
            gameObjects[texture.ref] = new THREE.Texture();
            loader = new THREE.ImageLoader(manager);
            loader.load(texture.file, function (image) {
                gameObjects[texture.ref].image = image;
                gameObjects[texture.ref].needsUpdate = true;
                loadingManager.objectLoaded();
            });
        }
    });

}

function playMission(missionCode) {

    var mission = missions[missionCode];
    console.log(mission);

    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMapEnabled = true;
    $('#container').innerHTML = '';
    $('#container').appendChild(renderer.domElement);

    if (mission.gameSettings == null) {
        mission.gameSettings = new Object();
    }
    if (mission.gameSettings.ambientLight != null) {
        AmbientLight = new THREE.AmbientLight(mission.settings.ambientLight);
        scene.add(AmbientLight);
    }

    sun = new THREE.SpotLight(0xffffff);
    sun.position.set(10,50,10);
    // must enable shadow casting ability for the light
    scene.add(sun);
    sun.shadowCameraVisible = false;
    sun.shadowDarkness = 0.1;
    sun.intensity = 1;
    sun.shadowCameraFov = 50;
    sun.castShadow = true;
    sun.target = camera;
    for (var key in gameObjects) {
        var obj = gameObjects[key];
        scene.add(obj);
    }
    render(); // Start looping the game

}

function hideInfoWindows() {
    infoWindows = document.getElementsByClassName('info-window animated fadeIn');
    for (i = 0; i < infoWindows.length; i++) {
        infoWindows[i].className = 'info-window hidden';
    }
}