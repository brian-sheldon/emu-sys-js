
// Copyright (C) 2026 Brian Sheldon
//
// MIT License

if ( typeof window !== 'object' ) {
  //global.EmuTestSub = require( './emu.test.sub.js' );
}

class EmuHex {
  constructor() {
    log.debug( 'EmuHex constructed ...' );
  }
  hi() {
    log.out( 'Hi from EmuHex ...' );
  }
  get sub() {
    return this._sub;
  }
  init() {
  }
  // basic
  x( b, ch = '0' ) {
    return b.toString( 16 ).padStart( 2, ch );
  }
  b( b, pad = '0' ) {
    return b.toString( 16 ).padStart( 2, pad );
  }
  w( w, pad = '0' ) {
    return w.toString( 16 ).padStart( 4, pad );
  }
  wb( wb, pad = '0' ) {
    return wb.toString( 16 ).padStart( 6, pad );
  }
  l( l, pad = '0' ) {
    return l.toString( 16 ).padStart( 8, pad );
  }
  // lines
  patterns( n ) {
    let ps = [];
    ps[0] = 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'; // 32
    ps[1] = 'xxxxxxxx xxxxxxxx xxxxxxxx xxxxxxxx'; // 35
    ps[2] = 'xxxxxxxx  xxxxxxxx  xxxxxxxx  xxxxxxxx'; // 38
    ps[3] = 'xxxx xxxx xxxx xxxx xxxx xxxx xxxx xxxx'; // 39
    ps[8] = 'xxxx xxxx xxxx xxxx  xxxx xxxx xxxx xxxx'; // 40
    ps[4] = 'xxxx xxxx xxxx  xxxx xxxx xxxx  xxxx xxxx'; // 41
    ps[5] = 'xxxx xxxx  xxxx xxxx  xxxx xxxx  xxxx xxxx'; // 42 - My favorite
    ps[6] = 'xx xx xx xx xx xx xx xx xx xx xx xx xx xx xx xx'; // 47
    ps[7] = 'xx xx xx xx xx xx xx xx  xx xx xx xx xx xx xx xx'; // 48
    return ps[n];
  }
  pattern( s ) {
    let pa = [];
    let state = 'x';
    let count = 0;
    for ( let i = 0; i < s.length; i++) {
      let ch = s.charAt( i );
      count++;
      if ( ch == state ) {
        if ( state == 'x' ) {
          if ( count % 2 ) {
            pa.push( 0 );
          }
        }
      } else {
        if ( state == ' ' ) {
          pa.push( count - 1 );
        }
        state = ch;
        count = 1;
      }
    }
    return pa;
  }
  bytes( data, base, width = 16, pattern = 8 ) {
    let patternStr = this.patterns( pattern );
    let patternNum = this.pattern( patternStr );
    let line = '';
    for ( let b = 0; b < width; b++ ) {
      let byt = data[ base + b ];
      let skip = patternNum[ b ];
      line += ' '.repeat( skip );
      line += this.b( byt );
    }
    return line;
  }
  ascii( data, base, width = 16 ) {
    let line = '';
    for ( let b = 0; b < width; b++ ) {
      let byt = data[ base + b ];
      let ch = String.fromCharCode( byt );
      line += byt > 0x20 && byt <= 0x7e ? ch : '.' ;
    }
    return line;
  }
  line( data, base, width = 16, pattern = 8, addrSep = ' ', asciiSep = ' ' ) {
    let addr = this.b( base & 0xff );
    //let addr = this.w( base );
    let bytes = this.bytes( data, base, width, pattern );
    let ascii = this.ascii( data, base, width );
    return addr + addrSep + bytes + asciiSep + ascii;
  }
  lines( data, base, rows, width = 16, pattern = 3, addrSep = '  ', asciiSep = '  ' ) {
    let lf = '\r\n';
    let lines = '';
    for ( let l = 0; l < rows; l++ ) {
      lines += l != 0 ? lf : '' ;
      lines += this.line( data, base, width, pattern, addrSep, asciiSep );
      base += width;
    }
    return lines;
  }
  //
  // tests
  //
  test( test ) {
    let data, s;
    switch ( test ) {
      case 'lines':
        log.testing( 'EmuHex.lines() ... testing ...' );
        data = Array( 1024 );
        for ( let b = 0; b < 1024; b++ ) {
          data[ b ] = Math.floor( Math.random() * 256 );
        }
        s = emu.hex.lines( data, 0, 16, 12 );
        log.testing( s );
        break;
    }
  }
}

if ( typeof window !== 'object' ) {
  module.exports = EmuHex;
}

