# Half-Life Engine JS

A JavaScript module to load Half Life mods in the browser.

This repository is based on [Xash3D](https://github.com/FWGS/xash3d-fwgs) a game engine aiming to provide compatibility with Half-Life Engine.

It ic currently based on an old JavaScript port [(Xash3D-Emscripten)](https://github.com/iCrazyBlaze/Xash3D-Emscripten). The goal is to rebase it on a newer WebAssembly build of [Xash3D](https://github.com/FWGS/xash3d-fwgs).

## Using the library

* Load [BrowserFS](https://github.com/jvilk/BrowserFS): `<script type='text/javascript' src='browserfs.min.js'></script>`
* Load this library: `<script type='text/javascript' src='lib/hl-engine.js'></script>`
* Initialize the engine:
  ```javascript
  HLEngine.init({
    canvas: document.getElementById('canvas'), // an existing <canvas> element where the game will be rendered
    location: 'lib', // URL path to the library and other files of this repo
    setStatus: (text) => { console.log(text); }, // Optional, a function to display status messages
  });
  ```
* Start the game:  
  You mush pass a .zip file containing the game files, the archive must contain a `valve` folder and optionally other mod folders.
  ```javascript
  HLEngine.start({
    zip: document.getElementById('zip'), // game files, either an <input type="file"> element or an ArrayBuffer of the zip file.
    filesystem: "RAM", //default, can be "IndexedDB" or "LocalStorage" 
    fullscreen: true,
    game: "valve", // the game to load, for example "cstrike"
    map: "", // optional the map to load, for example "de_dust2"
  });
  ```

* Go fullscreen
  ```javascript
  HLEngine.fullscreen()
  ```