
// Copyright (C) 2026 Brian Sheldon
//
// MIT License

//let Hex = require( './hex' );

//
//
// Io when running under NodeJs
//
//

function initIoNode() {
  if ( process.argv[2] == 'iotest' ) {
    let io = new IoNode( true );
  }
}

let keyCodes = [
  '1b5b357e', // PageUp
  '1b5b367e', // PageDown
  '1b5b317e', // Home
  '1b5b347e', // End
  '1b5b337e', // Del
  '1b5b327e', // Ins
  '1b4f50', // F1
  '1b4f51', // F2
  '1b4f52', // F3
  '1b4f53', // F4
  '1b5b31357e', // F5
  '1b5b31377e', // F6
  '1b5b31387e', // F7
  '1b5b31397e', // F8
  '1b5b32307e', // F9
  '1b5b32317e', // F10
  '1b5b323?7e', // F11
  '1b5b32347e', // F12
  '1b5b41', // Up
  '1b5b42', // Up
  '1b5b43', // Up
  '1b5b44', // Up
  '1b01',       // Ctrl-Alt-a

  '1b41',       // Alt-Shift-a

  '1b61',       // Alt-a
  '1b62',       // Alt-b
  '1b63',       // Alt-c
  '1b64',       // Alt-d
  '1b65',       // Alt-e
  '1b66',       // Alt-f
  '1b67',       // Alt-g
  '1b68',       // Alt-h
  '1b69',       // Alt-i
  '1b6a',       // Alt-j
  '1b6b',       // Alt-k
  '1b6c',       // Alt-l
  '1b6d',       // Alt-m
  '1b6e',       // Alt-n
  '1b6f',       // Alt-o
  '1b70',       // Alt-p
  '1b71',       // Alt-q
  '1b72',       // Alt-r
  '1b73',       // Alt-s
  '1b74',       // Alt-t
  '1b75',       // Alt-u
  '1b76',       // Alt-v
  '1b77',       // Alt-w
  '1b78',       // Alt-x
  '1b79',       // Alt-y
  '1b7a'       // Alt-z
];

class IoNode {
  constructor() {
    this._test = false;
    this._keyCallback = null;
    // io
    this._out = 'cmd'; // cmd or sys at this point
    // defined globals
    let self = this;
    global.write = function( s ) {
      self.write( s );
    }
    global.writeline = function( s ) {
      self.writeline( s );
    }
    // listen for keys
    this.addKeyEvent();
  }
  set test( test ) {
    this._test = test;
  }
  set keyCallback( func ) {
    this._keyCallback = func;
  }
  hex2( v ) {
    return v.toString( 16 ).padStart( 2, '0' );
  }
  //
  // Input
  //
  addKeyEvent() {
    let self = this;
    process.stdin.setRawMode( true );
    process.stdin.resume();
    process.stdin.setEncoding( 'utf8' );
    process.stdin.on( 'data', function( key ) {
      if ( key === '\x04' ) {
        writeline();
        writeline( 'Key: ctrl-d ... exiting ...' );
        process.exit();
      }
      self.key( key );
    });
  }
  hexstr( key ) {
    let hexstr = '';
    for ( let c in key ) {
      let ch = key[ c ];
      let cc = ch.charCodeAt( 0 );
      hexstr += this.hex2( cc );
    }
    return hexstr;
  }
  chunkAnsiStr( s ) {
    const regex = /\x1B\[[0-9;]*[a-zA-Z]|\x1B\w|./g;
    return s.match(regex) || [];
  }
  key( key ) {
    let len = key.length;
    let hexstr = this.hexstr( key );
    if ( this._keyCallback != null ) {
      if ( key.length > 1 ) {
        //if ( ! keyCodes.includes( hexstr ) ) {
          let keys = this.chunkAnsiStr( key );
          for ( let k in keys ) {
            let key = keys[k];
            let len = key.length;
            let hexstr = this.hexstr( key );
            this._keyCallback( key, len, hexstr );
          }
          return;
          //console.log();
          //console.log( hexstr );
          //console.log( this.chunkAnsiStr( key ) );
          //console.log();
        //}
      }
      this._keyCallback( key, len, hexstr );
    }
    if ( this._test ) {
      write( len + ' ' );
      writeline( hexstr );
    }
  }
  //
  // Output
  //
  write( s = '' ) {
    process.stdout.write( s );
  }
  writeline( s = '' ) {
    let lf = '\n';
    this.write( s + lf );
  }
}

initIoNode();

module.exports = IoNode;

