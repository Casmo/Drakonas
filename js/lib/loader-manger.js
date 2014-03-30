
/**
 * Object for managing loading stuff
 * @type {Object}
 */
var loadingManager = new Object();
loadingManager.totalObjects = 0;
loadingManager.loadedObjects = 0;
loadingManager.loadedCallback = function(){};
loadingManager.objectLoaded = function() {
    this.loadedObjects++;
    if (this.loadedObjects >= this.totalObjects) {
        loadingManager.loadedObjects = 0;
        this.loadedCallback();
    }
}