
if ( typeof window !== 'object' ) {
  global.EmuFsNode = require( './emu.fs.node.js' );
  //global.EmuDskMon = require( './emu.dsk.mon.js' );
}

class EmuDisk {
  hi() {
    log.out( 'Hi from EmuDisk ...' );
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
    log.debug( 'EmuDisk constructed for disk: ' + file.filename + ' ...' );
    //this.drv = 0;;
    //
    // basic disk parameters
    //
    this.drv = file.drv;
    this.path = file.path;
    this.filename = file.path + file.filename;
    this.cyls = params.cyls;
    this.trks = params.trks;
    this.secs = params.secs;
    this.secsize = params.secsize;
    this.secSize = this.secsize;
    this.mounted = false;
    //
    this.os = 'cpm';
    //
    // directory track and extents
    //
    //this.blks = params.blks; // calc
    this.usesTranslate = params.usesTranslate;
    this.translateTable = params.translateTable
    this.blktrk = params.blktrk;
    this.blksecs = params.blksecs;
    this.extsize = params.extsize;
    this.exts = params.exts;
    //
    //
    //
    this._ios = 0;
    this.buffer = this.newBuffer( this.secsize );
    this.inBuffer = false;
    if ( typeof window === 'object' ) {
      this.fs = new EmuFsDroid();
    } else {
      this.fs = new EmuFsNode();
    }
    this.fs.openSync( this.filename, 'r+' );
  }
  get params() {
    let d = {}
    d.filename = this.filename;
    d.cyls = this.cyls;
    d.trks = this.trks;
    d.secs = this.secs;
    d.secs = this.secsize;
    return d;
  }
  setdisk( s ) {
    this.filename = s;
    this.fs.closeSync();
    this.fs.openSync( this.filename, 'r+' );
  }
  newBuffer( size ) {
    if ( typeof( window ) == 'object' ) {
      return Array( size );
    } else {
      return Buffer.alloc( size );
    }
  }
  error() {
    return 'errors ...' ;
  }
  ios() {
    return this._ios;
  }
  size() {
    return this.cyls * this.trks * this.secs * this.secSize;
  }
  fill( val ) {
    this.buffer.fill( val );
  }
  //
  // disk - basic io
  //
  cylInRange( cyl ) {
    return cyl >= 0 && cyl < this.cyls;
  }
  trkInRange( trk ) {
    return trk >= 0 && trk < this.trks;
  }
  secInRange( sec ) {
    return sec > 0 && sec <= this.secs;
  }
  chk( cyl, trk, sec ) {
    let chk = true;
    chk &&= this.cylInRange( cyl );
    chk &&= this.trkInRange( trk );
    chk &&= this.secInRange( sec );
    return chk;
  }
  pos( cyl, trk, sec ) {
    let pos = cyl * this.trks * this.secs * this.secSize;
    pos += trk * this.secs * this.secSize;
    pos += ( sec - 1 ) * this.secSize;
    return pos;
  }
  secFn( fn, cyl, trk, sec, data, base = 0 ) {
    let stat = '';
    let chksum = 0;
    let pos;
    if ( this.chk( cyl, trk, sec ) ) {
      this._ios++;
      pos = this.pos( cyl, trk, sec );
      let inData, outData;
      if ( ! this.inBuffer ) {
        if ( fn == 'read' ) {
          if ( false ) {
            //this.fs.seek( pos );
            //let inData64 = this.fs.read( this.secSize );
            //inData = atob( inData64 );
            let n = this.fs.readSync( data, base, this.secSize, pos );
          } else {
            let n = this.fs.readSync( this.buffer, 0, this.secSize, pos );
            //log.out( n );
          }
        } else {
          //stat = dddddd( data.slice( base, base + this.secSize ) );
        }
      }
      let byt;
      for ( let b = 0; b < this.secSize; b++) {
        switch ( fn ) {
          case 'read':
            if ( this.inBuffer ) {
              //byt = data[ base + b ];
            } else {
              byt = this.buffer[ b ]; //.charCodeAt(0);
            }
            data[ base + b ] = byt;
            chksum = ( chksum + byt ) & 0xff;
            break;
          case 'write':
            byt = data[ base + b ] & 0xff;
            chksum = ( chksum + byt ) & 0xff;
            if ( this.inBuffer ) {
              this.buffer[ pos + b ] = byt;
            } else {
              this.buffer[ b ] = byt;
            }
            break;
        }
      }
      //stat += outData.length; + ' : ';
      if ( fn == 'write' && ! this.inBuffrr ) {
        //stat += ' writing';
        let n = this.fs.writeSync( this.buffer, 0, this.secSize, pos );
        //log.out( n );
      }
    }
    let head = this.head( fn, trk, sec, base, chksum );
    stat = head;
    //stat += ' chksum: ' + chksum;
    return stat;
  }
  secRead( cyl, trk, sec, data, base = 0 ) {
    let res = this.rd( cyl, trk, sec, data, base );
    return 'stat';
    //return this.secFn( 'read', cyl, trk, sec, data, base );
  }
  secWrite( cyl, trk, sec, data, base = 0) {
    let res = this.wr( cyl, trk, sec, data, base );
    return 'stat';
    //return this.secFn( 'write', cyl, trk, sec, data, base );
  }
  track( func, cyl, trk, sec, data, base ) {
    if ( ! this.track ) {
      this.track = {};
      this.track.disk = new Map();
      this.track.data = new Map();
    }
    let diskKey = cyl + '-' + trk + '-' + sec;
    let dataKey = base;
    let count = this.track.diskKey.get( diskKey );
    this.diskKey.set( count + 1) ;
  }
  rd( cyl, trk, sec, data, base = 0 ) {
    let stat = '';
    let chksum = 0;
    let pos, n;
    if ( this.chk( cyl, trk, sec ) ) {
      pos = this.pos( cyl, trk, sec );
      n = this.fs.readSync( data, base, this.secSize, pos );
      for ( let b = 0; b < this.secSize; b++ ) {
        let byt = data[ base + b ] & 0xff;
        chksum = ( chksum + byt ) & 0xff;
      }
    }
    let o = {};
    o.base = base; o.pos = pos; o.n = n; o.chksum = chksum;
    return o;
  }
  wr( cyl, trk, sec, data, base = 0 ) {
    let stat = '';
    let chksum = 0;
    let pos, n;
    if ( this.chk( cyl, trk, sec ) ) {
      pos = this.pos( cyl, trk, sec );
      let n = this.fs.writeSync( data, base, this.secSize, pos );
      for ( let b = 0; b < this.secSize; b++ ) {
        let byt = data[ base + b ] & 0xff;
        chksum = ( chksum + byt ) & 0xff;
      }
    }
    let o = {};
    o.base = base; o.pos = pos; o.n = n; o.chksum = chksum;
    return o;
  }
  dskFn( fn, data = null, base = 0 ) {
    for ( let c = 0; c < this.cyls; c++ ) {
      for ( let t = 0; t < this.trks; t++ ) {
        for( let s = 1; s <= this.secs; s++ ) {
          switch ( fn ) {
            case 'format':
              data = Array( this.secSize );
              data.fill( 0x00 );
              for ( let d = 0; d < this.secSize; d += 32 ) {
                data[ d ] = 0xe5;
              }
              this.secWrite( c, t, s, data );
              break;
            case 'dump':
              base = this.pos( c, t, s );
              this.secRead( c, t, s, data, base );
              break;
            case 'write':
              base = this.pos( c, t, s );
              this.secWrite( c, t, s, data, base );
              break;
          }
        }
      }
    }
  }
  all() {
    for ( let b = 0; b < this.size(); b += this.secSize * 15 ) {
      let byt = this.buffer[ b ];
      //console.log( byt );
    }
  }
  //
  // disk - high level
  //
  /*
  translate( reverse = false ) {
    let log2sec = [
      1,7,13,19,
      25,5,11,17,
      23,3,9,15,
      21,2,8,14,
      20,26,6,12,
      18,24,4,10,
      16,22
    ];
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
    let log2sec = this.translate();
    return log2sec[ sec - 1 ];
  }
  sec2log( sec ) {
    let reverse = true;
    let sec2log = this.translate( reverse );
    return sec2log[ sec - 1 ];
  }
  bootSec() {
  }
  trksec( trk, sec ) {
    let cyl, blk, blksec, abssec;
    let zblk, zblksec, ztrk, zsec; // adj to zero index
    switch ( this.os ) {
      case 'cpm':
        ztrk = trk - this.dirtrk;
        zsec = sec - 1;
        abssec = ztrk * this.secs + zsec;
        blk = Math.floor( abssec / this.blksecs );
        zblksec = abssec % this.blksecs;
        blksec = zblksec + 1;
        break;
    }
    return [ blk, blksec ];
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
        trk = ztrk + this.dirtrk;
        sec = zsec + 1;
        break;
    }
    return [ cyl, trk, sec ];
  }
  extentBlk( n ) {
    switch ( this.os ) {
      case 'cpm':
        this.extentSize = 32;
        this.blkSize = 1024;
        this.extentPerBlk = this.blkSize / this.extentSize;
        this.blk = ( this.extentSize ) / this.extentPerBlk;
        this.blkExtent = ( this.extentSize ) % this.extentPerBlk;
        break;
    }
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
    if ( trk < 2 ) {
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
    let exth = extent[13];
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
          f[ fn ].reserved = extent[14];
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
    o.exth = extent[13];
    o.reserved = extent[14];
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
      let o = this.files[ filename ] ? this.files[ filename ] : {} ;
      o.numblks = 0;
      o.records = extent[15];
      o.extnums = o.extnums ? o.extnums.push( ext ) : [ ext ] ;
      o.user = extent[0];
      let fileflag = extent.slice( 1, 12 );
      }
    }
    return lines;
  }
  file( file ) {
    let f = this.files();
    return f[ file.toUpperCase() ];
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
  fat() {
    let used = 0;
    let fat = Array( 256 ).fill( 0 );
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
            fat[ blk ] = i;
            used++;
          }
        }
      }
    }
    let lines = '';
    lines += 'Used: ' + used + '\r\n';
    lines += 'Unused: ' + ( 241 - used ) + '\r\n';
    lines += emu.hex.lines( fat, 0, 16, 16 );
    return lines;
  }
  */
}

if ( typeof window !== 'object' ) {
  module.exports = EmuDisk;
}

