document.getElementById('start').onclick = function() {
  const params = {
    args: "",
    filesystem: "RAM", //default, can be "IndexedDB" or "LocalStorage" 
  };
  params.args = document.getElementById('args').value.split(' ');  
  HLEngine.start(params);
}

HLEngine.init({
  zipElement: document.getElementById('zip'),
  statusElement: document.getElementById('status'),
  progressElement: document.getElementById('progress'),
  printOutput: document.getElementById('output'),
  canvas: document.getElementById('canvas'),
});

