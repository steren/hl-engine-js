document.getElementById('start').onclick = function() {
  const params = {};
  params.args = document.getElementById('args').value.split(' ');
  HLEngine.start(params);
}

HLEngine.init({
  statusElement: document.getElementById('status'),
  progressElement: document.getElementById('progress'),
  printOutput: document.getElementById('output'),
  canvas: document.getElementById('canvas'),
});
