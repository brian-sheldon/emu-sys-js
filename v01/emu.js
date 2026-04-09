
// Copyright (C) 2026 Brian Sheldon
//
// MIT License

if ( typeof window !== 'object' ) {
  global.EmuLog =  require( './emu.log.js' );
  global.EmuTest =  require( './emu.test.js' );
  global.EmuHex =  require( './emu.hex.js' );
  global.EmuIo =  require( './emu.io.js' );
  global.EmuFsNode =  require( './emu.fs.node.js' );
  global.EmuDiskCpm =  require( './emu.disk.cpm.js' );
  global.EmuMon =  require( './emu.mon.js' );
  //global.EmuSys =  require( './sys/sys.js' );
  //global.EmuDisks =  require( './emu.disks.js' );
  //global.EmuDskDisks =  require( './emu.dsk.disks.js' );
}

class Emu {
  constructor() {
    if ( typeof window != 'object' ) {
      this._env = 'node';
    } else {
      this._env = 'browser';
    }
    this.logLevel = 5;
    this._log = new EmuLog( this.env );
    this._log.debug( 'Emu constructed ...' );
  }
  get env() {
    /*
    if ( this._env != 'node' ) {
      return 'browser';
    } else {
      return 'node';
    }
    */
    return this._env;
  }
  init() {
    log.out( 'Emu init() ...' );
    //this._test = new EmuTest();
    this._hex = new EmuHex();
    this._io = new EmuIo();
    emu.io.init();
    let env;
    if ( typeof( window ) != 'object' ) {
      env = 'node';
    } else {
      if ( typeof( Droid ) == 'object' ) {
        env = 'droid-xterm';
      } else {
        env = 'browser-xterm';
      }
    }
    log.out( 'env: ' + env + ' detected ...' );
    switch ( env ) {
      case 'node':
        this._fs = EmuFsNode;
        this._disk = EmuDiskCpm;
        break;
      case 'droid-xterm':
        this._fs = EmuFsDroid;
        this._disk = EmuDiskCpm;
        break;
      case 'browser-xterm':
        this._fs = EmuFsIndexedDb;
        break;
      case 'browser':
        break;
    }
    log.out( 'EmuFs testing ...' );
    let buffer, n;
    let size = 128;
    if ( env == 'node' ) {
      buffer = Buffer.alloc( size );
    } else {
      buffer = Array( size );
    }
    let fs = new emu.fs();
    /*
    fs.openSync( 'get.sh', 'r+' );
    log.out( fs.length );
    fs.length = 256;
    log.out( fs.length );
    let buffer;
    buffer.fill( 0x41 );
    let n;
    n = fs.writeSync( buffer, 0, size, 0 );
    log.out( n );
    n = fs.readSync( buffer, 0, size, 0 );
    log.out( n );
    log.out( buffer.toString() );
    */
    //this._disks = new EmuDskDisks();
    //this._sys = new EmuSys();
    if ( env != 'browser-xterm' && false ) {
      let disk = new EmuDiskCpm;
      n = disk.secRead( 0, 0, 1, buffer, 0 );
      log.out( n );
      let s = emu.hex.lines( buffer, 0, 16, 8 );
      log.out( s );
    }
    //this._sys = EmuSys;
    this._mon = new EmuMon();
  }
  start() {
    emu.init();
    emu.hiAll();
    setTimeout( function() {
      emu.mon.cli.begin();
    }, 500 );
  }
  get log() {
    return this._log;
  }
  get test() {
    return this._test;
  }
  get hex() {
    return this._hex;
  }
  get io() {
    return this._io;
  }
  get fs() {
    return this._fs;
  }
  get disk() {
    return this._disk;
  }
  set disk( disk ) {
    this._disk = disk;
  }
  get sys() {
    return this._sys;
  }
  set sys( sys ) {
    this._sys = sys;
  }
  get mon() {
    return this._mon;
  }
  hi() {
    log.out( 'Hi from Emu ...' );
  }
  hiAll() {
    emu.hi();
    emu.log.hi();
    //emu.test.hi();
    //emu.test.sub.hi();
    emu.hex.hi();
    emu.io.hi();
    emu.mon.hi();
    emu.mon.cli.hi();
    emu.mon.cmd.hi();
    emu.mon.cmd.disk.hi();
    /*
    emu.disks.hi();
    emu.sys.hi();
    emu.mon.cmd.hi();
    */
    //emu.dsk.cmd.hi();
    //emu.dsk.cpm.hi();
  } 
}

/*
let log = function( s ) {
  if ( window ) {
    $('#log').append( s + '<br>' );
  } else {
    console.log( s );
  }
}
*/

function start() {
  if ( typeof window != 'object' ) {
    console.log( 'starting in ... node ...' + '\n' );
    global.emu = new Emu();
    //global.emu = emu;
    global.log = emu.log;
  } else {
    $('#log').append( 'starting in ... browser ...' + '<br>' );
    window.emu = new Emu();
    //window.emu = emu;
    window.log = emu.log;
  }
  //emu.hex.test( 'lines' );
  //emu.disks.init();
  //emu.sys.cpm();
  /*
  let data = Array( 1024 );
  for ( let b = 0; b < 1024; b++ ) {
    data[ b ] = Math.floor( Math.random() * 256 );
  }
  emu.log( emu.hex.lines( data, 0, 16, 12 ) );
  */
  emu.start();
}

let b2hex = function( b ) {
  return b.toString( 16 ).padStart( 2, '0' );
}

let b4hex = function( b ) {
  return b.toString( 16 ).padStart( 4, '0' );
}

if ( typeof window !== 'object' ) {
  //global.window = false;
  //global.b2hex = b2hex;
  //global.b4hex = b4hex;
  //global.emu = null;
} else {
  //window.emu = null;
}

start();

