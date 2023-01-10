const HlEngineParams = {
  statusElement: document.getElementById('status'),
  progressElement: document.getElementById('progress'),
  printOutput: document.getElementById('output'),
  args: "",
}


document.getElementById('args').onchange = function() {
  HlEngineParams.args = document.getElementById('args').value.split(' ');
}

document.getElementById('start').onclick = function() {
  startXash();
}
