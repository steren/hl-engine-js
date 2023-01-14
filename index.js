document.getElementById('start').onclick = () => {
  const params = {
    game: document.getElementById('game').value,
    map: document.getElementById('map').value,
    filesystem: "RAM",
    fullscreen: true,
    zip: document.getElementById('zip'),
  };
  HLEngine.start(params);
}

document.getElementById('fullscreen').onclick = HLEngine.fullscreen

function setStatus(text) {
  document.getElementById('status').innerHTML = text;
}

HLEngine.init({
  canvas: document.getElementById('canvas'),
  location: 'lib',
  setStatus: setStatus,
});
