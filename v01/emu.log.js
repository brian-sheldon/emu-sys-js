
// Copyright (C) 2026 Brian Sheldon
//
// MIT License

if ( typeof window !== 'object' ) {
  //global.EmuTestSub = require( './emu.test.sub.js' );
}

class EmuLog {
  constructor( env, testing = false ) {
    this.env = env;
    this.testing = testing;
    this.cache = '';
    this.ioIsReady = false;
    this.logLevel = 6;
    this.debug( 'EmuLog constructed ...' );
  }
  hi() {
    this.out( 'Hi from EmuLog ...' );
  }
  get sub() {
    //return this._sub;
  }
  init() {
  }
  ioOn( isOn ) {
    this.ioIsReady = isOn;
  }
  ioReady( io ) {
    this.io = io;
    this.ioIsReady = true;
    this.out( '\u001b[1;36m' );
    let lines = this.cache.split( '\n' );
    for ( let s of lines ) this.out( s );
  }
  ioDirector( s, dolf  ) {
    let lf = '';
    if ( ! this.ioIsReady ) {
      if ( this.testing ) {
        lf = '\n';
        process.stdout.write( s + lf );
      } else {
        lf = '\n';
        this.cache += s + lf;
      }
    } else {
      switch ( this.env ) {
      case 'browser':
      case 'webview':
        lf = dolf ? '\r\n' : '' ;
         this.io.write( s + lf );
        break;
      case 'node':
        lf = dolf ? '\n' : '' ;
        this.io.write( s + lf);
        break;
      }
    }
  }
  write( s, dolf = false ) {
    this.ioDirector( s, dolf );
  }
  line( s ) {
    this.write( s, true );
  }
  out( s ) {
    this.write( s, true );
  }
  fatal( s ) {
    if ( this.logLevel > 0 ) {
      this.out( s );
    }
  }
  error( s ) {
    if ( this.logLevel > 1 ) {
      this.out( s );
    }
  }
  warn( s ) {
    if ( this.logLevel > 2 ) {
      this.out( s );
    }
  }
  info( s ) {
    if ( this.logLevel > 3 ) {
      this.out( s );
    }
  }
  debug( s ) {
    if ( this.logLevel > 4 ) {
      this.out( s );
    }
  }
  testing( s ) {
    if ( this.logLevel > 5 ) {
      this.out( s );
    }
  }
}

if ( typeof window !== 'object' ) {
  module.exports = EmuLog;
}

