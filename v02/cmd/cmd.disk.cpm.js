
// Copyright (C) 2026 Brian Sheldon
//
// MIT License

const CmdFile = require( './cmd.file.js' );

class CmdDiskCpm extends CmdFile {
  constructor( cmd ) {
    super( cmd );
    this.file.blockSize = 128;
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
      case 'd':
      case 'dump':
        var addr = this.file.pos;
        if ( plen > 1 ) {
          addr = pnum( p1 ) != 'NaN' ? pnum( p1 ) : addr ;
        }
        var block = addr / this.file.blockSize;
        writeline( 'Disk block: ' + block );
        addr = this.file.dump( addr );
        this.cmd.defcmd = 'd-cpm dump';
        break;
      default:
        super.doCmd( cmd );
        break;
    }
  }
}

module.exports = CmdDiskCpm;

