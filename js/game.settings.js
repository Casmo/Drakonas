/**
 * File that hold all logic for game settings and saving new setting from the options.html
 * @author Mathieu de Ruiter
 * @link http://games.fellicht.nl
 */

/**
 * Object with all the default game settings.
 * @type {Object}
 */
var gameSettings = {};
gameSettings.availableMissions = '[1,2]';
gameSettings.unlockedMissions = '[0,1]';
gameSettings.currentMission = 1;
gameSettings.quality = 'high';
gameSettings.debug = false;
gameSettings.music = true;
gameSettings.effects = true;
gameSettings.controls = 'mouse';
gameSettings.score = 0;
gameSettings.hp = 100;
/**
 * List with current equipped weapons. Interval is based on time but might need to base it
 * on frames. (Use a counter loop in the render() perhaps. Minimum of 50 microseconds.
 * Weapons that are available can be found in availableWeapons array.
 * @see js/weapons.js
 * @type {Array}
 */
gameSettings.currentWeapons = '[{"weaponIndex": 0}]';

/**
 * Retrieve saved user settings and overrides the gameSettings. Also retrieving scores.
 * @type {Object}
 */
for (key in gameSettings) {
    storedValue = storageGetItem('gameSettings.' + key);
    if (storedValue != null) {
        gameSettings[key] = storedValue;
    }
}
// Store items
for (key in gameSettings) {
    storageSetItem('gameSettings.' + key, gameSettings[key]);
}
gameSettings.currentWeapons = JSON.parse(gameSettings.currentWeapons);
gameSettings.availableMissions = JSON.parse(gameSettings.availableMissions);
gameSettings.unlockedMissions = JSON.parse(gameSettings.unlockedMissions);