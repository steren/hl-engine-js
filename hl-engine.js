var myerrorbuf = ''
var myerrordate = new Date();
var mounted = false;
var gamedir = 'valve';
var moduleCount = 0;
//var mem = 150;
var mfs;
var zipSize;

try{mem = Math.round(window.location.hash.substring(1));}catch(e){};

function monitorRunDependencies(left) {
  this.totalDependencies = Math.max(this.totalDependencies, left);
  if(left)
    Module.setStatus('Preparing... (' + (this.totalDependencies-left) + '/' + this.totalDependencies + ')');
};

function setStatus(text) {
  if (!Module.setStatus.last) Module.setStatus.last = { time: Date.now(), text: '' };
  if (text === Module.setStatus.text) return;
  if(  new Date() - myerrordate > 3000 )
  {
    myerrordate = new Date();
    Module.print();
  }
  HLEngineParams.statusElement.innerHTML = text;
};

window.onerror = function(event) {
  if(mounted)
    FS.syncfs(false, function(err){Module.print('Saving IDBFS: '+err);});
  if( (''+event).indexOf('SimulateInfiniteLoop') > 0 )
    return;
  var text = 'Exception thrown: ' + event;
  text = text.replace(/&/g, "&amp;");
  text = text.replace(/</g, "&lt;");
  text = text.replace(/>/g, "&gt;");
  text = text.replace('\n', '<br>', 'g');
  Module.setStatus(text);
  Module.print('Exception thrown: ' + event);
};

var savedRun;

function mountZIP(data)
{
  var Buffer = BrowserFS.BFSRequire('buffer').Buffer;
  mfs.mount('/zip', new BrowserFS.FileSystem.ZipFS(Buffer.from(data)));
  FS.mount(new BrowserFS.EmscriptenFS(), {root:'/zip'}, '/rodir');
}


function setupFS(option)
{
  FS.mkdir('/rodir');
  FS.mkdir('/xash');
  try
  {
    mfs = new BrowserFS.FileSystem.MountableFileSystem();
    BrowserFS.initialize(mfs);
  }
  catch(e)
  {
    mfs = undefined;
    Module.print('Failed to initialize BrowserFS: '+e);
  }

  if( option === 'IndexedDB')
  {
    FS.mount(IDBFS,{},'/xash');
    FS.syncfs(true,function(err){if(err)Module.print('Loading IDBFS: ' + err);});
    mounted = true;
  }

  if( option === 'LocalStorage' && mfs)
  {
    mfs.mount('/ls', new BrowserFS.FileSystem.LocalStorage());
    FS.mount(new BrowserFS.EmscriptenFS(), {root:'/ls'}, '/xash');
    Module.print('LocalStorage mounted');
  }

  FS.chdir('/xash/');
}

function skipRun()
{
  savedRun = run;
  Module.run = () => {};
  run = () => {};

  Module.setStatus("Engine downloaded!");

  ENV.XASH3D_GAMEDIR = gamedir;
  ENV.XASH3D_RODIR = '/rodir'

  loadModules();
};

function loadXash() {
  var script = document.createElement('script');
  script.src = "xash.js";
  document.body.appendChild(script);
}

function loadModules() {
  function loadModule(name)
  {
    var script = document.createElement('script');
    script.onload = function(){moduleCount++;if(moduleCount==3){Module.setStatus("Scripts downloaded!");}};
    document.body.appendChild(script);
    script.src = name + ".js";
  }

  loadModule("server");
  loadModule("client");
  loadModule("menu");
}

var Module = {
  TOTAL_MEMORY: mem * 1024 * 1024,
  preRun: [],
  postRun: [],
  print: console.log,
  printErr: console.log,
  setStatus: setStatus,
  totalDependencies: 0,
  monitorRunDependencies: monitorRunDependencies,
  preInit: [skipRun],
  websocket: [],
};

var ENV = [];


function init(params){
  HLEngineParams = params;
  Module.canvas = params.canvas;
  Module.setStatus('Downloading...');
  loadXash();
}

function start(params)
{
  console.log("Starting with params: "+JSON.stringify(params));
  setupFS(params.filesystem);
  Module.arguments = params.args
  Module.run = run = savedRun;

  var reader = new FileReader();
  reader.onload = function(){
    mountZIP(reader.result);
    Module.print("Loaded zip data");
    savedRun();
    if(params.fullscreen) {
      Module.requestFullscreen(/* pointerLock */ true, /* resize */ false);
    }
  };
  reader.readAsArrayBuffer(HLEngineParams.zipElement.files[0]);
}


const HLEngine = {
  init: init,
  start: start,
}