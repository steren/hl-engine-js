# Half-Life Engine JS

A JavaScript module to play Half Life maps in the browser.

It is based on [Xash3D](https://github.com/FWGS/xash3d-fwgs) a game engine aiming to provide compatibility with Half-Life Engine.

It is currently based on an old JavaScript port ([Xash3D-Emscripten](https://github.com/iCrazyBlaze/Xash3D-Emscripten)). The intent is to rebase it on a [newer WebAssembly build](https://github.com/FWGS/xash3d-fwgs/issues/1226) of [Xash3D](https://github.com/FWGS/xash3d-fwgs).

## Using the library

* Load [BrowserFS](https://github.com/jvilk/BrowserFS): `<script type='text/javascript' src='browserfs.min.js'></script>`
* Create a JS module: `<script type="module" src='index.js'></script>`
* In this `index.js` file:
  - load this module: `import {init, start, fullscreen} from './lib/hl-engine.js';`
  - Initialize the engine:
    ```javascript
    init({
      canvas: document.getElementById('canvas'), // an existing <canvas> element where the game will be rendered
      location: 'lib', // URL path to the library and other files of this repo
      setStatus: (text) => { console.log(text); }, // Optional, a function to display status messages
    });
    ```
  - Start the game:  
    You must pass either one .zip file containing the game files (a `valve` folder and optionally other mod folder).
    Or you must pass two .zip files, one with the content of the `valve` folder and with the content of the mod folder.
    ```javascript
    start({
      // Game files as an ArrayBuffer of the zip file. 
      // Must contain a valve folder
      // See index.js for example of how to load from an <input> element
      zip: 
      // Alternatively, pass two zips: one including the inside of valve folder and one with the inside of the mod folder
      zipValve: // ArrayBuffer of a zip file of the inside of the valve folder.
      zipMod: // ArrayBuffer of a zip file of the inside of the valve folder.
      // Optional parameters
      mod: "", // the mod to load, for example "cstrike", if zipMod is passed, must match the mod name
      map: "", // optional the map to load, for example "de_dust2"
    });
    ```
  - Go fullscreen
    ```javascript
    fullscreen();
    ```
