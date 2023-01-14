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
  Module.print("Loaded zip data");
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

function loadXash(location) {
  var script = document.createElement('script');
  script.src = `${location}/xash.js`;
  document.body.appendChild(script);
}

function loadModules() {
  function loadModule(name)
  {
    var script = document.createElement('script');
    script.onload = function(){moduleCount++;if(moduleCount==3){Module.setStatus("Scripts downloaded!");}};
    document.body.appendChild(script);
    script.src = `${HLEngineParams.location}/${name}.js`;
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
  printErr: console.error,
  setStatus: console.info,
  totalDependencies: 0,
  monitorRunDependencies: monitorRunDependencies,
  preInit: [skipRun],
  websocket: [],
};

var ENV = [];


function init(params){
  HLEngineParams = params;
  if(!params.canvas) {
    return console.error("No canvas element provided");
  }

  Module.canvas = params.canvas;
  if(params.setStatus) {
    Module.setStatus = params.setStatus;
  }

  Module.setStatus('Downloading...');
  Module.memoryInitializerPrefixURL = params.location + "/";
  loadXash(params.location);
}

function start(params)
{
  console.log("Starting with params: "+JSON.stringify(params));

  setupFS(params.filesystem);
  
  let args = [];
  if(params.game) {
    args.push("-game");
    args.push(params.game);
  }
  if(params.map) {
    args.push("+map");
    args.push(params.map);
  }
  Module.arguments = args
  
  Module.run = run = savedRun;

  // if passed an input element for zip
  if(params.zip?.files?.length > 0) {
    var reader = new FileReader();
    reader.onload = function(){
      mountZIP(reader.result);
      savedRun();
      if(params.fullscreen) {
        Module.requestFullscreen(/* pointerLock */ true, /* resize */ false);
      }
    };
    reader.readAsArrayBuffer(params.zip.files[0]);
  } else {
    // assume zip passed as ArrayBuffer 
    mountZIP(params.zip);
    savedRun();
    if(params.fullscreen) {
      Module.requestFullscreen(/* pointerLock */ true, /* resize */ false);
    }
  }
}

function fullscreen() {
  Module.requestFullscreen(/* pointerLock */ true, /* resize */ false);
}

const HLEngine = {init, start, fullscreen}
