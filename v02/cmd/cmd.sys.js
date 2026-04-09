
// Copyright (C) 2026 Brian Sheldon
//
// MIT License

const fs = require( 'fs' );

class CmdSys {
  constructor( cmd ) {
    this.cmd = cmd;
    this.sys = null;
  }
  doCmd( cmd ) {
    let args = cmd.split( ' ' );
    let plen = args.length;
    let p0 = plen > 0 ? args[ 0 ] : '' ;
    let p1 = plen > 1 ? args[ 1 ] : '' ;
    let p2 = plen > 2 ? args[ 2 ] : '' ;
    let p3 = plen > 3 ? args[ 3 ] : '' ;
    let p4 = plen > 4 ? args[ 4 ] : '' ;
    if ( this.sys == null ) {
      let nosys = [ 'hi', 'zz', 'init' ];
      if ( ! nosys.includes( p0 ) ) {
        p0 = '';
        writeline( '... system needs to be initialized, use init [ systype ] ...' );
      }
    }
    switch ( p0 ) {
      case 'hi':
        writeline( '... CmdSys says hi ...' );
        break;
      case 'zz': // quick setup while developing
        this.sys = new SysCpm();
        this.sys.loadbin( '../roms/model1.rom', 0 );
        break;
      case 'b': // quick load boot sector
        //this.disk.secRead( 0, 0, 1, this.sys.mem, 0 );
        writeline( '... boot sector loaded at address: 0000 ...' );
        break;
      case 'on':
        break;
      case 'off':
        break;
      case 'init':
        if ( plen > 1 ) {
          switch ( p1 ) {
            case 'cpm':
              this.sys = new SysCpm();
              //this.cmd.mode = 's-cpm-';
              //this.cmd.prompt = 's-cpm-';
              break;
          }
        }
        break;
      case 'loadbin':
        var path = plen > 1 ? '../roms/' + p1 : '' ;
        var addr = plen > 2 ? pnum( p2 ) : 0 ;
        this.sys.loadbin( path, addr );
        break;
      case 'm':
      case 'mem':
      case 'dump':
        var addr = plen > 1 ? pnum( p1 ) : this.sys.addr ;
        var rows = plen > 2 ? pnum( p2 ) : 8 ;
        var cols = plen > 3 ? pnum( p3 ) : 16 ;
        var style = plen > 4 ? pnum( p4 ) : 3 ;
        var h = hexlines( addr, this.sys.mem, addr, rows, cols, style );
        writeline( h );
        this.sys.addr = addr + rows * cols;
        this.cmd.defcmd = this.cmd.mode + ' mem';
        break;
      case '':
        break;
      default:
        writeline( '... cmd: ' + p0 + ' not known ...' );
        break;
    }
  }
}

class Sys {
  constructor() {
    this._mem = null;
    this._addr = 0;
  }
  get addr() {
    return this._addr;
  }
  set addr( addr ) {
    this._addr = addr;
  }
  get mem() {
    return this._mem;
  }
  loadbin( path, addr ) {
    if ( fs.existsSync( path ) ) {
      writeline( 'Loading bin: ' + path );
      var buffer = fs.readFileSync( path );
      var len = buffer.length;
      for ( let b = 0; b < len; b++ ) {
        var byt = buffer[ b ];
        this.mem[ addr + b ] = byt;
      }
    } else {
      writeline( 'File not found: ' + path );
    }
  }
}

class SysCpm extends Sys {
  constructor() {
    super();
    this.init();
  }
  init() {
    this._mem = Buffer.alloc( 0x10000 );
  }
}

module.exports = CmdSys;

