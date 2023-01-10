document.getElementById('start').onclick = function() {
  const params = {
    args: "",
    filesystem: "RAM", //default, can be "IndexedDB" or "LocalStorage" 
  };
  params.args = document.getElementById('args').value.split(' ');  
  HLEngine.start(params);
}

document.getElementById('fullscreen').onclick = function() {
  Module.requestFullscreen(/* pointerLock */ true, /* resize */ false);
}

HLEngine.init({
  zipElement: document.getElementById('zip'),
  statusElement: document.getElementById('status'),
  canvas: document.getElementById('canvas'),
});

