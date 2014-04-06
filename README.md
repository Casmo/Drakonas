Drakonas
========
Drakonas will be a classic shoot 'em up game build with the Three.js library.  The idea is based on Raptor: Call of the shadows. A classic dos game published by Apogee Software.

General idea
----
The player will be playing missions with an upgradable airplane. In the missions the player earns money and collect weapons to upgrade his ship in the shop after a mission.

Details
----
* Missions will be loaded through a json file in /files/levels/<level-code>.json.
* Each mission has one or more objects, mostly loaded by an .obj export from Blender or other 3D programs.
* The player will be alive as long as it's HP is greater than zero.
* The player can buy (or find in one of the missions) shields, weapons, health and other tools that will be stored in IndexDB.

Contributing
----
Currently we have a very early prototype that can be found at http://games.fellicht.nl/drakonas/. It shows the current speed of the game and the idea of a mission. This will be a "live" update of the repository.

**3D designers:** The world will be made out of tiles that are 200 by 200 units (same units are used in Blender 3D and Three.js). You can use an .obj file located in /files/objects/ground/ as example to make your own. Important is that the anchor point of the object is located at 0 units so the world fit always together.
The size of the player is around 4x5 units and can be found in /files/objects/player/default.obj. Feel free to create your own fighter. We can use it as an upgrade.
The world will filled with environment objects like trees, buildings, bridges, etc. Nowadays stuff. Feel free to create your own that we can use in the game. Objects like those can be destroyed so it will be nice to have two different objects of the same sort: A normal and destroyed .obj.
We will build a hangar for the default menu where we can use all kinds of objects that can be find in a hangar. There should also be a sort of mission room where the player can select a (new) mission.
[...]

**Programmers:** We use Three.js library for creating the world. World or missions are loaded from json files that are just a big list with objects and locations. Enemies need to be programmed, weapons need to be created and everything that moves needs to move.

**Designers:** Textures for objects, the game interface, menu interface, weapon icons, etc.

**Writers:** If you are interested in writing stories finding the right names for missions, weapons, messages, mission briefs, etc you are more then welcome to help and write for us. Translations can be found in the /_locales/ folder and level names and briefings can be found in the /files/levels/ json files.