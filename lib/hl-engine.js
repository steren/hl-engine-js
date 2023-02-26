// This file is an half-cleaned up version of https://github.com/iCrazyBlaze/Xash3D-Emscripten/blob/master/xash.html
// Its exported API (see bottom of the file) must remain stable.
// TODO: Clean up this file when building on top of a newly built engine

var mounted = false;
var gamedir = 'valve';
var moduleCount = 0;
let mem = 0;
var mfs;
let HLEngineParams ;
var savedRun;

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

/**
 *
 * @param {ArrayBuffer} data: Zip to mount
 * @param {String} [folder]: Optional subpath to mount the zip at, for example `valve`
 */
function mountZIP(data, folder)
{
  var subpath = folder ? `/${folder}` : '';
  var Buffer = BrowserFS.BFSRequire('buffer').Buffer;
  mfs.mount(`/zip${subpath}`, new BrowserFS.FileSystem.ZipFS(Buffer.from(data)));
  if(folder) {
    FS.mkdir(`/rodir${subpath}`);
  }
  FS.mount(new BrowserFS.EmscriptenFS(), {root:`/zip${subpath}`}, `/rodir${subpath}`);
  Module.print(`Loaded zip data (${subpath})`);
}


function setupFS(option)
{
  const FS = window.FS;
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

  window.ENV.XASH3D_GAMEDIR = gamedir;
  window.ENV.XASH3D_RODIR = '/rodir'

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
  if(params.mod) {
    args.push("-game");
    args.push(params.mod);
  }
  if(params.map) {
    args.push("+map");
    args.push(params.map);
  }

  Module.arguments = [...args, ...params.args];

  Module.run = run = savedRun;

  if(params.zip) {
    mountZIP(params.zip);
  } else if(params.zipValve) {
    mountZIP(params.zipValve, "valve");
    if(params.zipMod) {
      mountZIP(params.zipMod, params.mod);
    }
  } else {
    throw new Error("No .zip of game files provided");
  }

  savedRun();
  if(params.fullscreen) {
    Module.requestFullscreen(/* pointerLock */ true, /* resize */ false);
  }
}

function fullscreen() {
  Module.requestFullscreen(/* pointerLock */ true, /* resize */ false);
}

// Global objects expected by xash.js
window.Module = Module;
// window.ENV

export {init, start, fullscreen}
