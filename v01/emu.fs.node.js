
// Copyright (C) 2026 Brian Sheldon
//
// MIT License

if ( typeof window !== 'object' ) {
  global.fs = require( 'fs' );
  //global.EmuDskMon = require( './emu.dsk.mon.js' );
}

class EmuFsNode {
  hi() {
    log.out( 'Hi from EmuFsNode ...' );
  }
  init() {
  }
  constructor() {
    log.debug( 'EmuFsNode constructed ...' );
    if ( typeof( Droid ) == 'object' ) {
      this.fs = Droid.CreateFile( 'app', fn, 'rw' );
      this.fo = Droid.CreateFile( 'app', 'dskio', 'rw' );
    } else if ( typeof( fs ) == 'object' ) {
      //this.fd = fs.openSync( 'cpma.cpm', 'r+' );
      //let len = fs.statSync( 'cpma.cpm' );
      //console.log( len );
      //let buffer = Buffer.alloc(128);
      //let res = fs.readSync( this.fd, buffer, 0, 128, 6656 );
      //console.log( res );
      //let s = emu.hex.lines( buffer, 0, 8, 16 );
      //console.log( s );
      //fs.closeSync( this.fd );
    }
  }
  error() {
    return 'errors ...' ;
  }
  get filename() {
    return this._filename;
  }
  openSync( filename, mode ) {
    this._filename = filename;
    this.fd = fs.openSync( filename, mode );
    return this;
  }
  get length() {
    let stat = fs.statSync( this._filename );
    //console.log( stat );
    let len = stat.size;
    //console.log( len );
    return len;
  }
  set length( len ) {
    fs.truncateSync( this._filename, len );
  }
  get pos() {
    return this._pos;
  }
  set pos( pos ) {
    this_pos = pos;
  }
  seek( pos ) {
    this.pos = pos;
  }
  readSync( data, addr, size, pos ) {
    let n = fs.readSync( this.fd, data, addr, size, pos );
    return n;
  }
  writeSync( data, addr, size, pos ) {
    let n = fs.writeSync( this.fd, data, addr, size, pos );
    return n;
  }
  //
  //
  //
  writeFileSync( filename, data, type = 'utf8' ) {
    return fs.writeFileSync( filename, type );
  }
  appendFileSync( filename, data, type = 'utf8' ) {
    return fs.appendFileSync( filename, type );
  }
  readFileSync( filename, type = 'utf8' ) {
    return fs.readFileSync( filename, type );
  }
}

if ( typeof window !== 'object' ) {
  module.exports = EmuFsNode;
}

