
var statusElement = document.getElementById('status');
var progressElement = document.getElementById('progress');
var asyncDialog = document.getElementById('asyncDialog');
var myerrorbuf = ''
var myerrordate = new Date();
var mounted = false;
var gamedir = 'valve';
var moduleCount = 0;
//var mem = 150;
var mfs;
var zipSize;

showElement('optionsTitle', false);

try{mem = Math.round(window.location.hash.substring(1));}catch(e){};

var Module = {
  TOTAL_MEMORY: mem * 1024 * 1024,
  preRun: [],
  postRun: [],
  print: (function() {
    var element = document.getElementById('output');
    if (element) element.value = ''; // clear browser cache
    return function(text) {
      if (arguments.length > 1) text = Array.prototype.slice.call(arguments).join(' ');
      // These replacements are necessary if you render to raw HTML
      //text = text.replace(/&/g, "&amp;");
      //text = text.replace(/</g, "&lt;");
      //text = text.replace(/>/g, "&gt;");
      //text = text.replace('\n', '<br>', 'g');
      //console.log(text);
      if(text)
        myerrorbuf += text + '\n';
      if (element) {
        if(element.value.length > 65536)
          element.value = element.value.substring(512) + myerrorbuf;
        else
          element.value += myerrorbuf;
        element.scrollTop = element.scrollHeight; // focus on bottom
      }
      myerrorbuf = ''
    };
  })(),
  printErr: function(text) {
    if (arguments.length > 1) text = Array.prototype.slice.call(arguments).join(' ');
    if (0) { // XXX disabled for safety typeof dump == 'function') {
      dump(text + '\n'); // fast, straight to the real console
    } else {
      if( myerrorbuf.length > 2048 )
      myerrorbuf = 'some lines skipped\n'+ myerrorbuf.substring(512);
      myerrorbuf += text + '\n';
      if(  new Date() - myerrordate > 3000 )
      {
        myerrordate = new Date();
        Module.print();
      }
    }
  },
  canvas: (function() {
    var canvas = document.getElementById('canvas');

    // As a default initial behavior, pop up an alert when webgl context is lost. To make your
    // application robust, you may want to override this behavior before shipping!
    // See http://www.khronos.org/registry/webgl/specs/latest/1.0/#5.15.2
    canvas.addEventListener("webglcontextlost", function(e) { alert('WebGL context lost. You will need to reload the page.'); e.preventDefault(); }, false);

    return canvas;
  })(),
  setStatus: function(text) {
    if (!Module.setStatus.last) Module.setStatus.last = { time: Date.now(), text: '' };
    if (text === Module.setStatus.text) return;
    if(  new Date() - myerrordate > 3000 )
    {
      myerrordate = new Date();
      Module.print();
    }

    statusElement.innerHTML = text;
    if( progressElement )
    {
      var m = text.match(/([^(]+)\((\d+(\.\d+)?)\/(\d+)\)/);

      if(m)
      {
        var progress = Math.round(parseInt(m[2])*100/parseInt(m[4]));
        progressElement.style.color = progress > 5?'#303030':'#aaa000';
        progressElement.style.width = progressElement.innerHTML = ''+progress+'%';
      }
      showElement('progress1', !!m);
    }
  },
  totalDependencies: 0,
  monitorRunDependencies: function(left) {
    this.totalDependencies = Math.max(this.totalDependencies, left);
    if(left)
      Module.setStatus('Preparing... (' + (this.totalDependencies-left) + '/' + this.totalDependencies + ')');
  }
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

function haltRun()
{
}

var savedRun;

function radioChecked(id)
{
  var r = document.getElementById('r'+id);
  if(r) return r.checked;
  return false;
}

function showElement(id, show)
{
  var e = document.getElementById(id);
  if(!e) return;
  e.style.display=show?'block':'none';
}
Module.setStatus('Downloading...');



function startXash()
{
  showElement('loader1', false);
  showElement('optionsTitle', false);
  showElement('fSettings', false);
  setupFS();
  Module.arguments = document.getElementById('iArgs').value.split(' ');
  Module.run = run = savedRun;

  var reader = new FileReader();
  reader.onload = function(){
    mountZIP(reader.result);
    Module.print("Loaded zip data");
    savedRun();
  };
  reader.readAsArrayBuffer(document.getElementById('iZipFile').files[0]);
  
  showElement('canvas', true);

  window.addEventListener("beforeunload", function (e) {
    var confirmationMessage = 'Leave the game?';

    (e || window.event).returnValue = confirmationMessage; //Gecko + IE
    return confirmationMessage; //Gecko + Webkit, Safari, Chrome etc.
  });
}

function mountZIP(data)
{
  var Buffer = BrowserFS.BFSRequire('buffer').Buffer;
  mfs.mount('/zip', new BrowserFS.FileSystem.ZipFS(Buffer.from(data)));
  FS.mount(new BrowserFS.EmscriptenFS(), {root:'/zip'}, '/rodir');
}

function fetchZIP(packageName, cb)
{
  var xhr = new XMLHttpRequest();
  xhr.open('GET', packageName, true);
  xhr.responseType = 'arraybuffer';

  xhr.onprogress = function(event) {
    var url = packageName;
    var size;
    if (event.total) size = event.total;
    if (event.loaded) {
      var total = size;
      var loaded = event.loaded;
      var num = 0;
      if (Module['setStatus']) Module['setStatus']('Downloading data... (' + loaded + '/' + total + ')');
    } else if (!Module.dataFileDownloads) {
      if (Module['setStatus']) Module['setStatus']('Downloading data...');
    }
  };
  xhr.onerror = function(event) {
    throw new Error("NetworkError");
  }
  xhr.onload = function(event) {
    if (xhr.status == 200 || xhr.status == 304 || xhr.status == 206 || (xhr.status == 0 && xhr.response)) { // file URLs can return 0
      mountZIP(xhr.response);
      cb();
    } else {
      throw new Error(xhr.statusText + " : " + xhr.responseURL);
    }
  };
  xhr.send(null);
}

function setupFS()
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

  if( radioChecked('IndexedDB'))
  {
    FS.mount(IDBFS,{},'/xash');
    FS.syncfs(true,function(err){if(err)Module.print('Loading IDBFS: ' + err);});
    mounted = true;
  }

  if( radioChecked('LocalStorage') && mfs)
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
  Module.run = haltRun;
  run = haltRun;

  Module.setStatus("Engine downloaded!");
  showElement('loader1', false);
  showElement('optionsTitle', true);

  if(window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB)
    showElement('idbHider', true);

  showElement('fSettings',true);

  ENV.XASH3D_GAMEDIR = gamedir;
  ENV.XASH3D_RODIR = '/rodir'

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
};

Module.preInit = [skipRun];
Module.websocket = [];
Module.websocket.url = 'wsproxy://TODO:3000/'
ENV = [];