document.getElementById('start').onclick = function() {
  const params = {
    game: document.getElementById('game').value,
    map: document.getElementById('map').value,
    filesystem: "RAM",
    fullscreen: true,
  };
  HLEngine.start(params);
}

HLEngine.init({
  zipElement: document.getElementById('zip'),
  statusElement: document.getElementById('status'),
  canvas: document.getElementById('canvas'),
  location: 'lib'
});

