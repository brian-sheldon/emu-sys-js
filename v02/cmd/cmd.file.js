
// Copyright (C) 2026 Brian Sheldon
//
// MIT License


class CmdFile {
  constructor( cmd ) {
    this.cmd = cmd;
    this.file = new File();
    this.file.blockSize = 256;
  }
  doCmd( cmd ) {
    let args = cmd.split( ' ' );
    let plen = args.length;
    let p0 = plen > 0 ? args[ 0 ] : '' ;
    let p1 = plen > 1 ? args[ 1 ] : '' ;
    let p2 = plen > 2 ? args[ 2 ] : '' ;
    let p3 = plen > 3 ? args[ 3 ] : '' ;
    let p4 = plen > 4 ? args[ 4 ] : '' ;
    switch ( p0 ) {
      case 'blocksize':
        writeline( 'blocksize: ' + this.file.blockSize );
        break;
      case 'path':
        if ( plen > 1 ) {
          this.file.path = p1;
        } else {
          writeline( this.file.path );
        }
        break;
      case 'open':
        if ( plen > 1 ) {
          this.file.path = p1;
        }
        break;
      case 'stat':
        var size = this.file.stat();
        writeline( 'File size: ' + size );
      case 'pos':
        if ( plen > 1 ) {
          this.file.pos = parseInt( p1, 16 );
        }
        writeline( 'File pos: ' + this.file.pos );
        break;
      case 'read':
        var buffer = Buffer.alloc( 512 );
        if ( this.file.stat() ) {
          this.file.read( buffer, 0, 512, 0 );
        }
        break;
      case 'd':
      case 'dump':
        var addr = this.file.pos;
        if ( plen > 1 ) {
          addr = parseInt( p1, 16 );
        }
        addr = this.file.dump( addr );
        this.cmd.defcmd = 'file dump';
        break;
      case 'close':
        this.file.close();
        break;
      default:
        break;
    }
  }
}

const fs = require( 'fs' );

class File {
  constructor( blockSize) {
    this._path = '';
    this.fd = null;
    this._pos = 0;
    this._blockSize = blockSize;
  }
  get blockSize() {
    return this._blockSize;
  }
  set blockSize( blockSize ) {
    this._blockSize = blockSize;
  }
  get pos() {
    return this._pos;
  }
  set pos( pos ) {
    this._pos = pos;
  }
  get path() {
    return this._path;
  }
  set path( path ) {
    if ( fs.existsSync( path ) ) {
      this._path = path;
      this.pos = 0;
      this.open();
    } else {
      writeline( '... file not found: ' + path );
    }
  }
  stat() {
    if ( this.fd != null ) {
      return fs.statSync( this.fd );
    } else {
      return -1;
    }
  }
  open() {
    if ( this.fd != null ) {
      this.close();
    }
    this.fd = fs.openSync( this.path, 'r' );
    writeline( 'File: ' + this.path + ' is open for reading' );
  }
  read( buffer, bufferoffset, len, filepos ) {
    if ( this.fd != null ) {
      return fs.readSync( this.fd, buffer, bufferoffset, len, filepos );
    } else {
      writeline( '... file not open ...' );
      return -1;
    }
  }
  dump( pos ) {
    this.pos = pos;
    let buffer = Buffer.alloc( this.blockSize );
    let len = this.read( buffer, 0, this.blockSize, pos );
    if ( len >= 0 ) {
      let rows = Math.ceil( len / 16 );
      let h = hexlines( this.pos, buffer, 0, rows, 16, 3 );
      writeline( h );
      if ( len < this.blockSize ) {
        writeline( '... end of file reached ...' );
        this.pos = 0;
      } else {
        this.pos += this.blockSize;
      }
    }
    return this.pos;
  }
  close() {
    if ( this.fd != null ) {
      fs.closeSync( this.fd );
      this.fd = null;
      this.pos = 0;
    }
  }
}

module.exports = CmdFile;

