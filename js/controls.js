/**
 * Global controls for better gameplayer experiences. This file handles pausing the game, enable users to switch
 * tabs without losing the game. Enter and exit fullscreen, etc.
 * Check if browser supports locking of mouse cursor.
 * @type {boolean}
 */
var havePointerLock = 'pointerLockElement' in document || 'mozPointerLockElement' in document || 'webkitPointerLockElement' in document;

window.addEventListener("keydown", function(e) {
    // esc || p
    if (e.keyCode == 27 || e.keyCode == 80) {
        e.preventDefault();
        e.stopPropagation();
        pause();
    }
    // g
    if (e.keyCode == 71) {
        gameOver(false);
    }
    // b
    if (e.keyCode == 66) {
        bossMode();
    }
    // s
    if (e.keyCode == 83) {
        shakeCamera();
    }
});
document.addEventListener('contextmenu', function(e) {
    e.preventDefault();
}, false);

window.addEventListener("blur", pause, false);
window.addEventListener("resize", onWindowResize, false);

// Set shooting
var mouseDown = false;
window.addEventListener("mousedown", function(event) {
    event.preventDefault();
    event.stopPropagation();
    mouseDown = true;
    shoot();
});
window.addEventListener("mouseup", function(event) {
    mouseDown = false;
});

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

var isInBossMode = false;
function bossMode() {
    if (isInBossMode == true) {
        isInBossMode = false;
        document.getElementById("bossmode").remove();
        return;
    }
    isInBossMode = true;
    bsodHtml = '';
    bsodHtml += '<div id="bossmode" style="position: absolute;padding:100px;left:0;top:0;z-index:999;line-height: 40px;width:100%;height:100%;background-color:#0000aa;color:#ffffff;font-family:courier;font-size: 12pt;text-align:left;">';
    bsodHtml += '<div style="text-align:center;"><div style="display:inline-block;background: #fff;color: #0000aa;padding: 2px 8px;font-weight: bold;">Drakonas</div></div>';
    bsodHtml += '<div>Oops, something terrible went wrong. Please restart your system or press "B" again.</div>';
    bsodHtml += '<div>In case of emergency please leave the building immediately. In any other case, please continue the game.</div>';
    bsodHtml += '<div>* Try not hitting any other objects during your mission, sir.</div>';
    bsodHtml += '<div>* Report your duty at games.fellicht.nl.</div>';
    bsodHtml += '<div>* Enjoy life. Smile!</div>';
    bsodHtml += '<div style="text-align:center;">Press the "B" key to continue...</div>';
    bsodHtml += '</div>';
    $('#b-container').innerHTML = bsodHtml;
    pause();
    return;
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

        document.getElementById('continue').addEventListener( 'click', function ( event ) {
            event.preventDefault();
            event.stopPropagation();
            launchFullscreen();
            element = document.documentElement;
            element.requestPointerLock = element.requestPointerLock || element.mozRequestPointerLock || element.webkitRequestPointerLock;
            element.requestPointerLock();
            return continueGame();
        }, false );

        document.getElementById('options').addEventListener( 'click', function ( event ) {
            event.preventDefault();
            event.stopPropagation();
            return getOptions();
        }, false );

        document.getElementById('exit').addEventListener( 'click', function ( event ) {
            event.preventDefault();
            event.stopPropagation();
            return gotoMenu();
        }, false );

    } else {
        document.getElementById('pause').innerHTML = 'Your browser probably sucks. Use <a href="http://getfirefox.com" target="_blank">Mozilla Firefox</a> or <a href="https://www.google.com/intl/en/chrome/browser/" target="_blank">Google Chrome</a> and report back for duty!';
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
var previousCursorPositionX = window.innerWidth / 2;
var previousCursorPositionY = window.innerHeight / 2;
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

function exit() {
    if (!window.close()) {
        $('#container').innerHTML = '<div class="title text-center">Drakonas</div>';
        $('#container').innerHTML += '<div class="text-center"><p>Thanks for playing! Close the window by pressing "ctrl + w" or "alt + F4".</p><p>Check <a href="http://games.fellicht.nl/">games.fellicht.nl</a> for more amazing games!</p></div>';
    }
}


/**
 * @author qiao / https://github.com/qiao
 * @author mrdoob / http://mrdoob.com
 * @author alteredq / http://alteredqualia.com/
 * @author WestLangley / http://github.com/WestLangley
 * @author erich666 / http://erichaines.com
 */
/*global THREE, console */

// This set of controls performs orbiting, dollying (zooming), and panning. It maintains
// the "up" direction as +Y, unlike the TrackballControls. Touch on tablet and phones is
// supported.
//
//    Orbit - left mouse / touch: one finger move
//    Zoom - middle mouse, or mousewheel / touch: two finger spread or squish
//    Pan - right mouse, or arrow keys / touch: three finter swipe
//
// This is a drop-in replacement for (most) TrackballControls used in examples.
// That is, include this js file and wherever you see:
//    	controls = new THREE.TrackballControls( camera );
//      controls.target.z = 150;
// Simple substitute "OrbitControls" and the control should work as-is.

THREE.OrbitControls = function ( object, domElement ) {

    this.object = object;
    this.domElement = ( domElement !== undefined ) ? domElement : document;

    // API

    // Set to false to disable this control
    this.enabled = true;

    // "target" sets the location of focus, where the control orbits around
    // and where it pans with respect to.
    this.target = new THREE.Vector3();

    // center is old, deprecated; use "target" instead
    this.center = this.target;

    // This option actually enables dollying in and out; left as "zoom" for
    // backwards compatibility
    this.noZoom = false;
    this.zoomSpeed = 1.0;

    // Limits to how far you can dolly in and out
    this.minDistance = 0;
    this.maxDistance = Infinity;

    // Set to true to disable this control
    this.noRotate = false;
    this.rotateSpeed = 1.0;

    // Set to true to disable this control
    this.noPan = false;
    this.keyPanSpeed = 7.0;	// pixels moved per arrow key push

    // Set to true to automatically rotate around the target
    this.autoRotate = false;
    this.autoRotateSpeed = 2.0; // 30 seconds per round when fps is 60

    // How far you can orbit vertically, upper and lower limits.
    // Range is 0 to Math.PI radians.
    this.minPolarAngle = 0; // radians
    this.maxPolarAngle = Math.PI; // radians

    // Set to true to disable use of the keys
    this.noKeys = false;

    // The four arrow keys
    this.keys = { LEFT: 37, UP: 38, RIGHT: 39, BOTTOM: 40 };

    ////////////
    // internals

    var scope = this;

    var EPS = 0.000001;

    var rotateStart = new THREE.Vector2();
    var rotateEnd = new THREE.Vector2();
    var rotateDelta = new THREE.Vector2();

    var panStart = new THREE.Vector2();
    var panEnd = new THREE.Vector2();
    var panDelta = new THREE.Vector2();
    var panOffset = new THREE.Vector3();

    var offset = new THREE.Vector3();

    var dollyStart = new THREE.Vector2();
    var dollyEnd = new THREE.Vector2();
    var dollyDelta = new THREE.Vector2();

    var phiDelta = 0;
    var thetaDelta = 0;
    var scale = 1;
    var pan = new THREE.Vector3();

    var lastPosition = new THREE.Vector3();

    var STATE = { NONE : -1, ROTATE : 0, DOLLY : 1, PAN : 2, TOUCH_ROTATE : 3, TOUCH_DOLLY : 4, TOUCH_PAN : 5 };

    var state = STATE.NONE;

    // for reset

    this.target0 = this.target.clone();
    this.position0 = this.object.position.clone();

    // events

    var changeEvent = { type: 'change' };
    var startEvent = { type: 'start'};
    var endEvent = { type: 'end'};

    this.rotateLeft = function ( angle ) {

        if ( angle === undefined ) {

            angle = getAutoRotationAngle();

        }

        thetaDelta -= angle;

    };

    this.rotateUp = function ( angle ) {

        if ( angle === undefined ) {

            angle = getAutoRotationAngle();

        }

        phiDelta -= angle;

    };

    // pass in distance in world space to move left
    this.panLeft = function ( distance ) {

        var te = this.object.matrix.elements;

        // get X column of matrix
        panOffset.set( te[ 0 ], te[ 1 ], te[ 2 ] );
        panOffset.multiplyScalar( - distance );

        pan.add( panOffset );

    };

    // pass in distance in world space to move up
    this.panUp = function ( distance ) {

        var te = this.object.matrix.elements;

        // get Y column of matrix
        panOffset.set( te[ 4 ], te[ 5 ], te[ 6 ] );
        panOffset.multiplyScalar( distance );

        pan.add( panOffset );

    };

    // pass in x,y of change desired in pixel space,
    // right and down are positive
    this.pan = function ( deltaX, deltaY ) {

        var element = scope.domElement === document ? scope.domElement.body : scope.domElement;

        if ( scope.object.fov !== undefined ) {

            // perspective
            var position = scope.object.position;
            var offset = position.clone().sub( scope.target );
            var targetDistance = offset.length();

            // half of the fov is center to top of screen
            targetDistance *= Math.tan( ( scope.object.fov / 2 ) * Math.PI / 180.0 );

            // we actually don't use screenWidth, since perspective camera is fixed to screen height
            scope.panLeft( 2 * deltaX * targetDistance / element.clientHeight );
            scope.panUp( 2 * deltaY * targetDistance / element.clientHeight );

        } else if ( scope.object.top !== undefined ) {

            // orthographic
            scope.panLeft( deltaX * (scope.object.right - scope.object.left) / element.clientWidth );
            scope.panUp( deltaY * (scope.object.top - scope.object.bottom) / element.clientHeight );

        } else {

            // camera neither orthographic or perspective
            console.warn( 'WARNING: OrbitControls.js encountered an unknown camera type - pan disabled.' );

        }

    };

    this.dollyIn = function ( dollyScale ) {

        if ( dollyScale === undefined ) {

            dollyScale = getZoomScale();

        }

        scale /= dollyScale;

    };

    this.dollyOut = function ( dollyScale ) {

        if ( dollyScale === undefined ) {

            dollyScale = getZoomScale();

        }

        scale *= dollyScale;

    };

    this.update = function () {

        var position = this.object.position;

        offset.copy( position ).sub( this.target );

        // angle from z-axis around y-axis

        var theta = Math.atan2( offset.x, offset.z );

        // angle from y-axis

        var phi = Math.atan2( Math.sqrt( offset.x * offset.x + offset.z * offset.z ), offset.y );

        if ( this.autoRotate ) {

            this.rotateLeft( getAutoRotationAngle() );

        }

        theta += thetaDelta;
        phi += phiDelta;

        // restrict phi to be between desired limits
        phi = Math.max( this.minPolarAngle, Math.min( this.maxPolarAngle, phi ) );

        // restrict phi to be betwee EPS and PI-EPS
        phi = Math.max( EPS, Math.min( Math.PI - EPS, phi ) );

        var radius = offset.length() * scale;

        // restrict radius to be between desired limits
        radius = Math.max( this.minDistance, Math.min( this.maxDistance, radius ) );

        // move target to panned location
        this.target.add( pan );

        offset.x = radius * Math.sin( phi ) * Math.sin( theta );
        offset.y = radius * Math.cos( phi );
        offset.z = radius * Math.sin( phi ) * Math.cos( theta );

        position.copy( this.target ).add( offset );

        this.object.lookAt( this.target );

        thetaDelta = 0;
        phiDelta = 0;
        scale = 1;
        pan.set( 0, 0, 0 );

        if ( lastPosition.distanceTo( this.object.position ) > 0 ) {

            this.dispatchEvent( changeEvent );

            lastPosition.copy( this.object.position );

        }

    };


    this.reset = function () {

        state = STATE.NONE;

        this.target.copy( this.target0 );
        this.object.position.copy( this.position0 );

        this.update();

    };

    function getAutoRotationAngle() {

        return 2 * Math.PI / 60 / 60 * scope.autoRotateSpeed;

    }

    function getZoomScale() {

        return Math.pow( 0.95, scope.zoomSpeed );

    }

    function onMouseDown( event ) {

        if ( scope.enabled === false ) return;
        event.preventDefault();

        if ( event.button === 0 ) {
            if ( scope.noRotate === true ) return;

            state = STATE.ROTATE;

            rotateStart.set( event.clientX, event.clientY );

        } else if ( event.button === 1 ) {
            if ( scope.noZoom === true ) return;

            state = STATE.DOLLY;

            dollyStart.set( event.clientX, event.clientY );

        } else if ( event.button === 2 ) {
            if ( scope.noPan === true ) return;

            state = STATE.PAN;

            panStart.set( event.clientX, event.clientY );

        }

        scope.domElement.addEventListener( 'mousemove', onMouseMove, false );
        scope.domElement.addEventListener( 'mouseup', onMouseUp, false );
        scope.dispatchEvent( startEvent );

    }

    function onMouseMove( event ) {

        if ( scope.enabled === false ) return;

        event.preventDefault();

        var element = scope.domElement === document ? scope.domElement.body : scope.domElement;

        if ( state === STATE.ROTATE ) {

            if ( scope.noRotate === true ) return;

            rotateEnd.set( event.clientX, event.clientY );
            rotateDelta.subVectors( rotateEnd, rotateStart );

            // rotating across whole screen goes 360 degrees around
            scope.rotateLeft( 2 * Math.PI * rotateDelta.x / element.clientWidth * scope.rotateSpeed );

            // rotating up and down along whole screen attempts to go 360, but limited to 180
            scope.rotateUp( 2 * Math.PI * rotateDelta.y / element.clientHeight * scope.rotateSpeed );

            rotateStart.copy( rotateEnd );

        } else if ( state === STATE.DOLLY ) {

            if ( scope.noZoom === true ) return;

            dollyEnd.set( event.clientX, event.clientY );
            dollyDelta.subVectors( dollyEnd, dollyStart );

            if ( dollyDelta.y > 0 ) {

                scope.dollyIn();

            } else {

                scope.dollyOut();

            }

            dollyStart.copy( dollyEnd );

        } else if ( state === STATE.PAN ) {

            if ( scope.noPan === true ) return;

            panEnd.set( event.clientX, event.clientY );
            panDelta.subVectors( panEnd, panStart );

            scope.pan( panDelta.x, panDelta.y );

            panStart.copy( panEnd );

        }

        scope.update();

    }

    function onMouseUp( /* event */ ) {

        if ( scope.enabled === false ) return;

        scope.domElement.removeEventListener( 'mousemove', onMouseMove, false );
        scope.domElement.removeEventListener( 'mouseup', onMouseUp, false );
        scope.dispatchEvent( endEvent );
        state = STATE.NONE;

    }

    function onMouseWheel( event ) {

        if ( scope.enabled === false || scope.noZoom === true ) return;

        event.preventDefault();

        var delta = 0;

        if ( event.wheelDelta !== undefined ) { // WebKit / Opera / Explorer 9

            delta = event.wheelDelta;

        } else if ( event.detail !== undefined ) { // Firefox

            delta = - event.detail;

        }

        if ( delta > 0 ) {

            scope.dollyOut();

        } else {

            scope.dollyIn();

        }

        scope.update();
        scope.dispatchEvent( startEvent );
        scope.dispatchEvent( endEvent );

    }

    function onKeyDown( event ) {

        if ( scope.enabled === false || scope.noKeys === true || scope.noPan === true ) return;

        switch ( event.keyCode ) {

            case scope.keys.UP:
                scope.pan( 0, scope.keyPanSpeed );
                scope.update();
                break;

            case scope.keys.BOTTOM:
                scope.pan( 0, - scope.keyPanSpeed );
                scope.update();
                break;

            case scope.keys.LEFT:
                scope.pan( scope.keyPanSpeed, 0 );
                scope.update();
                break;

            case scope.keys.RIGHT:
                scope.pan( - scope.keyPanSpeed, 0 );
                scope.update();
                break;

        }

    }

    function touchstart( event ) {

        if ( scope.enabled === false ) return;

        switch ( event.touches.length ) {

            case 1:	// one-fingered touch: rotate

                if ( scope.noRotate === true ) return;

                state = STATE.TOUCH_ROTATE;

                rotateStart.set( event.touches[ 0 ].pageX, event.touches[ 0 ].pageY );
                break;

            case 2:	// two-fingered touch: dolly

                if ( scope.noZoom === true ) return;

                state = STATE.TOUCH_DOLLY;

                var dx = event.touches[ 0 ].pageX - event.touches[ 1 ].pageX;
                var dy = event.touches[ 0 ].pageY - event.touches[ 1 ].pageY;
                var distance = Math.sqrt( dx * dx + dy * dy );
                dollyStart.set( 0, distance );
                break;

            case 3: // three-fingered touch: pan

                if ( scope.noPan === true ) return;

                state = STATE.TOUCH_PAN;

                panStart.set( event.touches[ 0 ].pageX, event.touches[ 0 ].pageY );
                break;

            default:

                state = STATE.NONE;

        }

        scope.dispatchEvent( startEvent );

    }

    function touchmove( event ) {

        if ( scope.enabled === false ) return;

        event.preventDefault();
        event.stopPropagation();

        var element = scope.domElement === document ? scope.domElement.body : scope.domElement;

        switch ( event.touches.length ) {

            case 1: // one-fingered touch: rotate

                if ( scope.noRotate === true ) return;
                if ( state !== STATE.TOUCH_ROTATE ) return;

                rotateEnd.set( event.touches[ 0 ].pageX, event.touches[ 0 ].pageY );
                rotateDelta.subVectors( rotateEnd, rotateStart );

                // rotating across whole screen goes 360 degrees around
                scope.rotateLeft( 2 * Math.PI * rotateDelta.x / element.clientWidth * scope.rotateSpeed );
                // rotating up and down along whole screen attempts to go 360, but limited to 180
                scope.rotateUp( 2 * Math.PI * rotateDelta.y / element.clientHeight * scope.rotateSpeed );

                rotateStart.copy( rotateEnd );

                scope.update();
                break;

            case 2: // two-fingered touch: dolly

                if ( scope.noZoom === true ) return;
                if ( state !== STATE.TOUCH_DOLLY ) return;

                var dx = event.touches[ 0 ].pageX - event.touches[ 1 ].pageX;
                var dy = event.touches[ 0 ].pageY - event.touches[ 1 ].pageY;
                var distance = Math.sqrt( dx * dx + dy * dy );

                dollyEnd.set( 0, distance );
                dollyDelta.subVectors( dollyEnd, dollyStart );

                if ( dollyDelta.y > 0 ) {

                    scope.dollyOut();

                } else {

                    scope.dollyIn();

                }

                dollyStart.copy( dollyEnd );

                scope.update();
                break;

            case 3: // three-fingered touch: pan

                if ( scope.noPan === true ) return;
                if ( state !== STATE.TOUCH_PAN ) return;

                panEnd.set( event.touches[ 0 ].pageX, event.touches[ 0 ].pageY );
                panDelta.subVectors( panEnd, panStart );

                scope.pan( panDelta.x, panDelta.y );

                panStart.copy( panEnd );

                scope.update();
                break;

            default:

                state = STATE.NONE;

        }

    }

    function touchend( /* event */ ) {

        if ( scope.enabled === false ) return;

        scope.dispatchEvent( endEvent );
        state = STATE.NONE;

    }

    this.domElement.addEventListener( 'contextmenu', function ( event ) { event.preventDefault(); }, false );
    this.domElement.addEventListener( 'mousedown', onMouseDown, false );
    this.domElement.addEventListener( 'mousewheel', onMouseWheel, false );
    this.domElement.addEventListener( 'DOMMouseScroll', onMouseWheel, false ); // firefox

    this.domElement.addEventListener( 'touchstart', touchstart, false );
    this.domElement.addEventListener( 'touchend', touchend, false );
    this.domElement.addEventListener( 'touchmove', touchmove, false );

    window.addEventListener( 'keydown', onKeyDown, false );

};

THREE.OrbitControls.prototype = Object.create( THREE.EventDispatcher.prototype );