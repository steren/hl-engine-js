const HlEngineParams = {
  statusElement: document.getElementById('status'),
  progressElement: document.getElementById('progress'),
  printOutput: document.getElementById('output'),
  args: "",
}

document.getElementById('start').onclick = function() {
  HlEngineParams.args = document.getElementById('args').value.split(' ');

  startXash(HlEngineParams);
}
