document.getElementById('start').onclick = function() {
  const params = {
    game: document.getElementById('game').value,
    map: document.getElementById('map').value,
    filesystem: "RAM",
    fullscreen: true,
    zip: document.getElementById('zip'),
  };
  HLEngine.start(params);
}

function setStatus(text) {
  document.getElementById('status').innerHTML = text;
}

HLEngine.init({
  canvas: document.getElementById('canvas'),
  location: 'lib',
  setStatus: setStatus,
});
