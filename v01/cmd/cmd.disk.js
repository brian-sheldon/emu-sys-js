
// Copyright (C) 2026 Brian Sheldon
//
// MIT License

if ( typeof window !== 'object' ) {
  //global.EmuTestSub = require( './emu.test.sub.js' );
}

class EmuCmdDisk {
  constructor( mon ) {
    log.debug( 'EmuCmdDisk constructed ...' );
    this._mon = mon;
    //this._sub = new Emuxxx();
    this.init();
  }
  hi() {
    log.out( 'Hi from EmuCmdDisk ...' );
  }
  //get sub() {
    //return this._sub;
  //}
  init() {
    //this.file = './disks/cpm/cpma.cpm';
    this.file = './disks/trs80/disk_0.dsk';
    this.cyls = 1;
    this.trks = 77;
    this.secs = 26;
    this.secSize = 128;
    this.blkSize = 1024;
    this.extents = 64;
    this.extentTrk = 2;
    this.logSecAuto = true;
    this.logSec = false;
    this.trk = 0;
    this.sec = 1;
    this.extent = 1;
    //this.disk = new emu.disk( this.file, this.cyls, this.trks, this.secs, this.secSize );
    //emu.disk = this.disk;
    this.buffer = new Uint8Array( this.secSize );
  }
  //
  // disks - cmd
  //
  nextSector() {
  }
  nextExtent() {
    this.extent = this.extent < 64 ? this.extent + 1 : 1 ;
  }
  exec( io, cmd ) {
    let sys, state, disk;
    if ( emu.sys ) {
      sys = emu.sys;
      state = sys.state;
      disk = state.disk;
      //disk = state.disk ? state.disk : emu.disk ;
    }
    let parms = cmd.split( ' ' );
    let plen = parms.length;
    let p0 = plen > 0 ? parms[0] : '' ;
    let p1 = plen > 1 ? parms[1] : '' ;
    let p2 = plen > 2 ? parms[2] : '' ;
    let p3 = plen > 3 ? parms[3] : '' ;
    let pass = false;
    let defCmd = ''; 
    switch ( p0 ) {
      case 'test':
        var tst = parms.length > 1 ? parseInt( parms[1] ) : 1 ;
        io.write( '.' );
        let test = new Test( log.write );
        io.write( '.' );
        //let log = test.run( tst );
        //log.write( log );
        io.write( '\r\n' );
        break;
      case 'mount':
        var dr = 2;
        var path = 'disks/cpm/';
        var filename = path + 'volks4th.cpm';
        if ( plen > 1 ) {
          dr = parseInt( p1 );
        }
        io.line( dr );
        io.line( sys.disks[ dr ].path );
        io.line( sys.disks[ dr ].filename );
        if ( plen > 3 ) {
          path = p2;
          filename = p3;
        }
        //sys.disks[ dr ].setDisk( path + filename );
        io.line( sys.disks[ dr ].setDisk );
        io.line( dr );
        io.line( sys.disks[ dr ].path );
        io.line( sys.disks[ dr ].filename );
      case 'log2sec':
        if ( plen == 2 ) {
          var res = disk.log2sec( p1 );
          io.line( res );
        }
        break;
      case 'dr':
        //this.drv = p1;
        //this.disk = 
        break;
      case 'sec2log':
        if ( plen == 2 ) {
          var res = disk.sec2log( p1 );
          io.line( res );
        }
        break;
      case 'blksec':
        if ( plen == 3 ) {
          var res = disk.blksec( p1, p2 );
          io.line( res[1] + ':' + res[2] );
        }
        break;
      case 'trksec':
        if ( plen == 3 ) {
          var res = disk.trksec( p1, p2 );
          io.line( res[0] + ':' + res[1] );
        }
        break;
      case 'logsec': // toggle use logical sector increments
        this.logSec = this.logSec ? false : true ;
        var sl = 'Logical sector tranlation is ';
        sl += this.logSec ? 'on' : 'off' ;
        io.line( sl );
        break;
      case 'drv':
        if ( parms.length > 1 ) sys.drv = parseInt( parms[1] );
        io.line( sys.state.drv );
        break;
      case 'sdir':
        var files = disk.files();
        var keys = Object.keys( files ).sort();
        var cols = 3;
        var rows = Math.ceil( keys.length / cols );
        s = '';
        let needlf = true;
        var count = 0;
        for ( var i = 0; i < keys.length; i++ ) {
        //for ( var r = 0; r < rows; r++ ) {
          //for ( var c = 0; c < cols; c++ ) {
           // var i = c * rows + r;
            //io.line( i );
            if ( i < keys.length ) {
              let fn = keys[ i ];
              let [ name, ext ] = fn.split( '.' );
              let file = files[ fn ];
              let len = file.blks.length;
              let recs = file.records;
              s += name.padEnd( 9, ' ' );
              s += ext.padEnd( 4, ' ' );
              s += len.toString().padStart( 4, ' ' ) + 'k';
              count++;
              if ( ( count % 3 ) == 0 ) {
                s += '\r\n';
                needlf = false;
              } else {
                s += ' | ';
                needlf = true;
              }
            //}
          }
        }
        if ( needlf ) s += '\r\n';
        s = s.slice( 0, -2 );
        io.line( s );
        break;
      //
      // sector views
      //
      case 'bt':
        if ( ! pass ) {
          this.logSec = false;
          this.trk = 0;
          this.sec = 1;
          pass = true;
        }
        io.line();
      case 'dir':
        if ( ! pass ) {
          this.logSec = true;
          this.trk = disk.blktrk;
          this.sec = 1;
          pass = true;
        }
      case 'file':
        if ( ! pass ) {
          if ( plen == 2 ) {
            var file = disk.file( p1 );
            if ( typeof( file ) == 'string' ) {
              state.filename = '';
              io.line( file );
              break;
            }
            state.filename = p1;
            io.line( JSON.stringify( file, null ) );
            var blks = file.blks;
            state.fileblks = blks;
            state.filelen = blks.length;
            state.filerecs = file.records;
            state.fileblk = 0;
            state.filesec = 1;
          }
          if ( state.filename == '' || typeof( state.filename ) == 'undefined') {
            break;
          }
          io.line( JSON.stringify( state.fileblks, null ) );
          var blk = state.fileblks[ state.fileblk ];
          var rec = state.fileblk * 8 + state.filesec; 
          io.line( 'file block: ' + ( state.fileblk + 1 ) + ' of ' + state.filelen + ' record: ' + rec + ' of ' + state.filerecs );
          var trksec = disk.blksec( blk, state.filesec );
          this.trk = trksec[1];
          this.sec = trksec[2];
          var l = state.filelen;
          var s = state.filesec;
          if ( state.filesec < 8 ) {
            state.filesec++;
          } else {
            state.filesec = 1;
            state.fileblk++;
            if ( state.fileblk >= state.filelen ) {
              state.fileblk = 0;
            }
          }
          defCmd = p0;
          pass = true;
        }
      case 'disk':
        var drv, trk, sec;
        if ( parms.length > 2 ) {
          trk = parseInt( parms[1] );
          sec = parseInt( parms[2] );
          this.trk = trk;
          this.sec = sec;
        } else {
          trk = this.trk;
          sec = this.sec;
        }
        //var st = [ 1,7,13,19,25,5,11,17,23,3,9,15,21,2,8,14,20,26,6,12,18,24,4,10,16,22 ];
        var data = this.buffer;
        //var logical = trk >= 2 ? true : false ;
        //sec = logical ? st[ sec - 1 ] : sec ;
        sec = disk.usesTranslate && trk >= disk.blktrk ? disk.log2sec( sec ) : sec ;
        let base = 0;
        var res = disk.rd( 0, trk, sec, data, base );
        var head = disk.head( 'read', trk, sec, base, res.chksum );
        io.line( head );
        s = emu.hex.lines( data, 0, 8, 16 );
        io.line( s );
        this.sec++;
        if ( this.sec > disk.secs ) {
          this.trk++;
          this.sec = 1;
        }
        if ( defCmd == '' ) {
          defCmd = 'disk';
        }
        break;
      case 'ext':
      case 'extent':
        this.extent = plen == 2 ? parseInt( p1 ) : this.extent ;
        io.line( 'Extent: ' + this.extent );
        var s = disk.extHex( this.extent );
        io.line( s );
        this.extent = this.extent < disk.exts ? this.extent + 1 : 1 ;
        defCmd = p0;
        break;
      case 'exto':
      case 'extobject':
        this.extent = plen == 2 ? parseInt( p1 ) : this.extent ;
        io.line( 'Extent: ' + this.extent );
        var o = disk.extObj( this.extent );
        this.nextExtent();
        defCmd = p0;
        break;
      case 'exts':
      case 'extents':
        var s = '';
        if ( plen > 0 ) {
          io.line( 'extents: ' );
          s = typeof( disk.extents );
          s = disk.extents( p1 );
        }
        io.line( s );
        break;
      case 'files':
        var f = disk.files();
        io.line( JSON.stringify( f, null ) );
        break;
      case 'find':
        if ( plen > 1 ) {
          var s = disk.find( p1 );
          io.line( s );
        }
        break;
      case 'fat':
        var s = disk.fat();
        io.line( s );
        break;
      case 'free':
        var s = disk.free();
        io.line( s.toString() );
        break;
      case 'upload':
        var s = disk.upload( p1 );
        //io.line( s.toString() );
        break;
      case 'diskinfo':
        io.line( sys.disks[0].filename );
        io.line( sys.disks[1].filename );
        io.line( sys.disks[2].filename );
        io.line( sys.disks[3].filename );
        break;
      case 'setdisk':
        if ( plen > 1 ) {
          var d = parseInt( p1 );
          var fn = p2;
          sys.disks[ d ].setdisk( p2 );
        }
        break;
      case 'help':
        if ( p1 == '' || p1 == 'help' ) {
          io.line( 'log2sec' );
          io.line( 'sec2log' );
          io.line( 'trksec' );
          io.line( 'blksec' );
          io.line( 'drv' );
          io.line( 'disk    view next sector and' );
          io.line( '        automatcally update next sector.' );
          io.line( '        Logical sector table will apply' );
          io.line( '        when applicable, not used on system trks.' );
          io.line( 'bt' );
          io.line( 'dir     vieww next dir sector.' );
          io.line( 'extents view all used directory extents.' );
          io.line( 'extent  view next extent.' );
          io.line( 'fat     view table of used blocks with extent number' );
          io.line( '        ,generated, not on disk.' );
          }
        break;
    }
    return defCmd;
  }
}

if ( typeof window !== 'object' ) {
  module.exports = EmuCmdDisk;
}

