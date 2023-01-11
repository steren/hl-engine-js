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
    zipElement: document.getElementById('zip'),
    statusElement: document.getElementById('status'),
    canvas: document.getElementById('canvas'), // an existing <canvas> element where the game will be rendered
    location: 'lib', // URL path to the library and other files of this repo
  });
  ```
* Start the game:
  ```javascript
  HLEngine.start({
    filesystem: "RAM", //default, can be "IndexedDB" or "LocalStorage" 
    fullscreen: true,
    game: "valve", // the game to load, for example "cstrike"
    map: "", // optional the map to load, for example "de_dust2"
  });
  ```