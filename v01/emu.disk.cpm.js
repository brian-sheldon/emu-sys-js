
if ( typeof window !== 'object' ) {
  //global.fs = require( 'fs' );
  global.EmuDisk = require( './emu.disk.js' );
}

class EmuDiskCpm extends EmuDisk {
  hi() {
    log.out( 'Hi from EmuDiskCpm ...' );
  }
  get mon() {
    //return this._mon;
  }
  init() {
  }
  //
  // dsk - cpm
  //
  constructor( file, params ) {
    //console.log( file );
    //console.log( params );
    super( file, params );
    log.debug( 'EmuDiskCpm constructed for disk: ' + file.filename + ' ...' );
  }
  //
  // disk - basic io
  //
  /*
  pos( cyl, trk, sec ) {
    let pos = cyl * this.trks * this.secs * this.secSize;
    pos += trk * this.secs * this.secSize;
    pos += ( sec - 1 ) * this.secSize;
    return pos;
  }
  */
  //
  // disk - high level utility functions
  //
  translate( reverse = false ) {
    let log2sec = this.translateTable;
    let sec2log = Array( 26 );
    for ( let i = 0; i < 26; i++ ) {
      sec2log[ log2sec[ i ] - 1 ] = i + 1;
    }
    if ( ! reverse ) {
      return log2sec;
    } else {
      return sec2log;
    }
  }
  log2sec( sec ) {
    if ( this.secInRange( sec ) ) {
      if ( this.usesTranslate ) {
        return this.translate()[ sec - 1 ];
      } else {
        return sec;
      }
    } else {
      log.error( 'Error - sector not in range ...' );
    }
  }
  sec2log( sec ) {
    if ( this.secInRange( sec ) ) {
      if ( this.usesTranslate ) {
        return this.translate( true )[ sec - 1 ];
      } else {
        return sec;
      }
    } else {
      log.error( 'Error - sector not in range ...' );
    }
  }
  bootSec() {
  }
  trksec( trk, sec ) {
    //if ( this.chk( 0, trk, sec ) ) {
      let cyl, blk, blksec, abssec;
      let zblk, zblksec, ztrk, zsec; // adj to zero index
      switch ( this.os ) {
        case 'cpm':
          ztrk = trk - this.blktrk;
          zsec = sec - 1;
          abssec = ztrk * this.secs + zsec;
          blk = Math.floor( abssec / this.blksecs );
          zblksec = abssec % this.blksecs;
          blksec = zblksec + 1;
          break;
      }
      return [ blk, blksec ];
    //}
  }
  blksec( blk, blksec ) {
    let cyl, trk, sec;
    let zblk, zblksec, ztrk, zsec; // adj to zero index
    switch ( this.os ) {
      case 'cpm':
        zblksec = blksec - 1;
        ztrk = Math.floor( ( blk * this.blksecs + zblksec ) / this.secs );
        zsec = ( blk * this.blksecs + zblksec  ) % this.secs;
        cyl = 0;
        trk = ztrk + this.blktrk;
        sec = zsec + 1;
        break;
    }
    return [ cyl, trk, sec ];
  }
  extentBlk( n ) {
    console.log( 'extentBlk .....' );
    this.blksize = this.blksecs * this.secsize;
    this.extperblk = this.blksize / this.extsize;
    this.blk = ( this.extsize ) / this.extperblk;
    this.blkext = ( this.extsize ) % this.extperblk;
    return [ blk, blkext ];
  }
  dirEntry() {
    switch ( this.os ) {
      case 'cpm':
        break;
    }
  }
  head( fn, trk, sec, base, chksum ) {
    let blk, blksec;
    let logsec = this.sec2log( sec );
    if ( trk < this.blktrk ) {
      blk = '--';
      blksec = '--';
    } else {
      let res = this.trksec( trk, logsec );
      blk = res[0];
      blksec = res[1];
    }
    let head = '';
    head += 'mem: ' + base.toString( 16 ).padStart( 4, '0' );
    head += '  drv: ' + this.drv;
    head += '  trk: ' + trk;
    head += '  sec: ' + sec;
    head += '  log: ' + logsec;
    head += '\r\n';
    head += 'blk: ' + blk + ':' +  blksec;
    head += '  op: ' + fn;
    head += '  size: ' + this.secSize;
    head += '  chksum: ' + chksum;
    //stat = head + stat;
    //stat += ' chksum: ' + chksum;
    return head;
  }
  //
  // extents
  //
  extent( ext ) {
    let zext = ext - 1;
    let blkexts = this.blksecs * 4;
    let blk = Math.floor( zext / blkexts );
    let zblksec = Math.floor( ( zext % blkexts ) / 4 );
    let secext = ( zext % blkexts ) % 4;
    let blksec = zblksec + 1;
    let res = this.blksec( blk, blksec );
    let trk = res[1];
    let logsec = res[2];
    let sec = this.log2sec( logsec );
    //let buffer = Array( this.secSize );
    this.secRead( 0, trk, sec, this.buffer, 0 );
    let extent = this.buffer.slice( secext * 32, secext * 32 + 32 );
    return extent;
  }
  extHex( ext ) {
    let extent = this.extent( ext );
    let s = emu.hex.lines( extent, 0, 2, 16 );
    return s;
  }
  fileflags( extent ) {
    let fileflag = extent.slice( 1, 12 );
    let e = {};
    e.filename = '';
    e.flags = [];
    let i = 0;
    for ( let v of fileflag ) {
      e.flags.push( ( v & 0x80 ) >> 7 );
      let c = v & 0x7f;
      if ( c != 32) {
        let ch =  String.fromCharCode( c );
        e.filename += i == 8 ? '.' : '' ;
        e.filename += c != 0x20 ? ch : '' ;
      }
      i++;
    }
    return e;
  }
  fileExtNum( extent ) {
    let extl = extent[12];
    let exth = extent[14];
    let extnum = ( exth & 0xff ) + ( extl & 0x1f );
    return extnum;
  }
  remZeroBlks( files ) {
    for ( let key in files ) {
      let file = files[ key ];
      let nzblks = [];
      for ( let blk of file.blks ) {
        if ( blk != 0 ) nzblks.push( blk );
      }
      file.blks = nzblks;
      file.size = file.blks.length;
    }
  }
  files() {
    let f = {};
    let filenames = new Set();
    for ( let sec = 0; sec < 8; sec++ ) {
    }
    for ( let ext = 0; ext < 64; ext++ ) {
      let extent = this.extent( ext + 1 );
      let user = extent[ 0 ];
      if ( user != 0xe5 ) {
        let e = this.fileflags( extent );
        let extnum = this.fileExtNum( extent );
        let fn = e.filename;
        //console.log( fn );
        if ( ! filenames.has( fn ) ) {
          f[ fn ] = {};
          f[ fn ].filename = fn;
          f[ fn ].records = 0;
          f[ fn ].size = 0;
          f[ fn ].extents = [];
          f[ fn ].blks = [];
          filenames.add( fn );
        }
        f[ fn ].records += extent[ 15 ];
        f[ fn ].extents.push( extnum );
        if ( extnum == 0 ) {
          f[ fn ].user = null;
          f[ fn ].reserved = extent[13];
          f[ fn ].flags = e.flags;
        }
        let blks = extent.slice( 16, 32 );
        for ( let b = 0; b < 16; b++ ) {
          f[ fn ].blks[ extnum * 16 + b ] = blks[ b ];
        }
      }
    }
    this.remZeroBlks( f );
    return f;
  }
  extObj( ext ) {
    let extent = this.extent( ext );
    let o = {};
    o.user = extent[0];
    o.flags = [];
    o.file = '';
    let fileflag = extent.slice( 1, 12 );
    let i = 0;
    for ( let v of fileflag ) {
      o.flags.push( ( v & 0x80 ) >> 7 );
      let ch = v & 0x7f;
      if ( ch != 32) {
        o.file += i == 8 ? '.' : '' ;
        o.file += String.fromCharCode( ch );
      }
      i++;
    }
    o.extl = extent[12];
    o.exth = extent[14];
    o.reserved = extent[13];
    o.numblks = 0;
    o.records = extent[15];
    o.blks = [];
    let blks = extent.slice( 16, 32 );
    for ( let blk of blks ) {
      if ( blk != 0 ) {
        o.blks.push( blk );
      }
    }
    //console.log( o );
    return o;
  }
  extents( file = '' ) {
    let lf = '';
    let lines = '';
    for ( let i = 0; i < 64; i++ ) {
      let ext = this.extHex( i + 1 );
      let exta = this.extent( i + 1 );
      if ( exta[ 0 ] != 0xe5 ) {
        lines += lf + ext;
        lf = '\r\n';
        /*
      let o = this.files[ filename ] ? this.files[ filename ] : {} ;
      o.numblks = 0;
      o.records = extent[15];
      o.extnums = o.extnums ? o.extnums.push( ext ) : [ ext ] ;
      o.user = extent[0];
      let fileflag = extent.slice( 1, 12 );
        */
      }
    }
    return lines;
  }
  file( fn ) {
    fn = fn.toUpperCase();
    let files = this.files();
    if ( files[ fn ] ) {
      return files[fn ];
    } else {
      return 'file ' + fn + ' not found ...';
    }
  }
  find( file ) {
    let lf = '';
    let lines = '';
    for ( let i = 0; i < 64; i++ ) {
      let extfile = this.extObj( i ).file;
      if ( file.toUpperCase() == extfile ) {
        lines += lf + this.extHex( i );
        lf = '\r\n';
      }
    }
    return lines;
  }
  fato() {
    let used = 0;
    let fat = new Uint8Array( 256 ).fill( 0 );
    for ( let i = 0; i < 64; i++ ) {
      let ext = this.extent( i + 1 );
      let first = ext[0];
      if ( first != 0xe5 ) {
        let blks = ext.slice( 16, 32 );
        for ( let b = 0; b < 16; b++ ) {
          let blk = blks[ b ];
          if ( blk != 0 ) {
            if ( fat[ blk ] != 0 ) {
              log.write( 'block: ' + blk + ' in use ...\r\n' );
            }
            fat[ blk ] = i + 1;;
            used++;
          }
        }
      }
    }
    let o = {};
    o.used = used;
    o.unused = 241 - used;
    o.fat = fat;
    return o;
  }
  fat() {
    let o = this.fato();
    let lines = '';
    lines += 'Used: ' + o.used + '\r\n';
    lines += 'Unused: ' + o.unused + '\r\n';
    lines += emu.hex.lines( o.fat, 0, 16, 16 );
    return lines;
  }
  free() {
    let o = this.fato();
    let free = [];
    for ( let i in o.fat ) {
      let blk = o.fat[ i ];
      if ( i > 1 && i < 243 && blk == 0 ) {
        free.push( i );
      }
    }
    return free;
  }
  upload( filename ) {
    let size = this.secSize;
    let free = this.free();
    let fs = new EmuFsNode();
    fs.openSync( filename, 'r+' );
    let len = fs.length;
    let padlen = size - ( len % size );
    let buffer = new Uint8Array( len + padlen );
    let n = fs.readSync( buffer, 0, len, 0 );
    let numblks = Math.ceil( n / size );
    buffer.fill( 0x00, len );
    console.log( buffer.length );
    let b = 0;
    let blk = free[ b ];
    let blksec = 1;
    for ( let i = 0; i < numblks; i++ ) {
      let trksec = this.blksec( blk, blksec );
      let trk = trksec[1];
      let sec = trksec[2];
      console.log( blk + ' : ' + trk + ' : ' + sec );
      //let sector = buffer.slice( i = size, i * size + size );
      //this.wr( 0, trk, sec, buffer, i * size );
    }
  }
}

if ( typeof window !== 'object' ) {
  module.exports = EmuDiskCpm;
}

