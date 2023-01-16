import {init, start, fullscreen} from './lib/hl-engine.js';

document.getElementById('start').onclick = () => {
  const reader = new FileReader();
  reader.onload = function(){
    const params = {
      mod: document.getElementById('mod').value,
      map: document.getElementById('map').value,
      filesystem: "RAM",
      fullscreen: true,
      zip: reader.result,
    };
    start(params);
  }
  reader.readAsArrayBuffer(document.getElementById('zip').files[0]);
}

document.getElementById('fullscreen').onclick = fullscreen

function setStatus(text) {
  document.getElementById('status').innerHTML = text;
}

init({
  canvas: document.getElementById('canvas'),
  location: 'lib',
  setStatus: setStatus,
});
