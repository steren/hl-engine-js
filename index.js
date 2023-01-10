const HLEngineParams = {
  statusElement: document.getElementById('status'),
  progressElement: document.getElementById('progress'),
  printOutput: document.getElementById('output'),
  args: "",
}

document.getElementById('start').onclick = function() {
  HLEngineParams.args = document.getElementById('args').value.split(' ');

  HLEngine.start(HLEngineParams);
}

HLEngine.init();
