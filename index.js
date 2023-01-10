function radioChecked(id)
{
  var r = document.getElementById('r'+id);
  if(r) return r.checked;
  return false;
}

document.getElementById('start').onclick = function() {
  const params = {
    args: "",
    filesystem: "RAM", //default, can be "IndexedDB" or "LocalStorage" 
  };
  params.args = document.getElementById('args').value.split(' ');
  
  if( radioChecked("IndexedDB")) {
    params.filesystem = "IndexedDB";
  }
  else if( radioChecked("LocalStorage")) {
    params.filesystem = "LocalStorage";
  }
  
  HLEngine.start(params);
}

HLEngine.init({
  zipElement: document.getElementById('zip'),
  statusElement: document.getElementById('status'),
  progressElement: document.getElementById('progress'),
  printOutput: document.getElementById('output'),
  canvas: document.getElementById('canvas'),
});

