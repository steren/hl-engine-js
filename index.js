document.getElementById('start').onclick = function() {
  const params = {
    args: "",
    filesystem: "RAM", //default, can be "IndexedDB" or "LocalStorage" 
    fullscreen: true,
  };
  params.args = document.getElementById('args').value.split(' ');  
  HLEngine.start(params);
}

HLEngine.init({
  zipElement: document.getElementById('zip'),
  statusElement: document.getElementById('status'),
  canvas: document.getElementById('canvas'),
  location: 'lib'
});

