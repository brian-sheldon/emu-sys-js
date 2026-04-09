//
// Some commonly used hex, oct, bin, asc, hexdump globals
// and a Hex class.  Plus a bonus ruler to measure output,
// useful for refining output to fit to desired terminal width.
//

function initHex() {
  let rulerStr = [
    '         1         2         3         4         5         6         7         8         9         0',
    '....^....0....^....0....^....0....^....0....^....0....^....0....^....0....^....0....^....0....^....0'
  ];
  let h = new Hex();
  global.hex0 = function( v, w = 0, ch = '0' ) {
    return h.hex( v, w, ch );
  }
  global.hex2 = function( v, ch = '0' ) {
    return h.hex( v, 2, ch );
  }
  global.hex4 = function( v, ch = '0' ) {
    return h.hex( v, 4, ch );
  }
  global.hex6 = function( v, ch = '0' ) {
    return h.hex( v, 6, ch );
  }
  global.hex8 = function( v, ch = '0' ) {
    return h.hex( v, 8, ch );
  }
  global.hex10 = function( v, ch = '0' ) {
    return h.hex( v, 10, ch );
  }
  global.hex12 = function( v, ch = '0' ) {
    return h.hex( v, 12, ch );
  }
  global.hex14 = function( v, ch = '0' ) {
    return h.hex( v, 14, ch );
  }
  global.hex16 = function( v, ch = '0' ) {
    return h.hex( v, 16, ch );
  }
  global.asc = function( s ) {
    return h.asc( v );
  }
  global.oct0 = function( v, w = 0, ch = '0' ) {
    return v.toString( 8 ).padStart( w, ch );
  }
  global.bin0 = function( v, w = 0, ch = '0' ) {
    return v.toString( 2 ).padStart( w, ch );
  }
  global.bin4 = function( v, ch = '0' ) {
    return bin0( v, 4, ch = '0' );
  }
  global.bin8 = function( v, ch = '0' ) {
    return bin0( v, 8, ch = '0' );
  }
  global.bin16 = function( v, ch = '0' ) {
    return bin0( v, 16, ch = '0' );
  }
  global.bin32 = function( v, ch = '0' ) {
    return bin0( v, 32, ch = '0' );
  }
  global.hexlines = function( addr, data, base = 0, rows = 8, cols = 16, style = 3 ) {
    return h.lines( addr, data, base, rows, cols, style );
  }
  global.ruler = function( w = 80 ) {
    let r1, r2;
    [ r1, r2 ] = rulerStr;
    r1 = r1.slice( 0, w );
    r2 = r2.slice( 0, w );
    return r1 + '\n' + r2;
  }
}




class Hex {
  constructor() {
  }
  hex( v, w = 0, ch = '0' ) {
    return v.toString( 16 ).padStart( w, ch );
  }
  asc( v ) {
    let ch = String.fromCharCode( v );
    ch = v > 0x20 && v <= 0x7e ? ch : '.' ;
    return ch;
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
      let hex = '  ';
      if ( ( base + b ) < data.length ) {
        let byt = data[ base + b ];
        hex = this.b( byt );
      }
      let skip = patternNum[ b ];
      line += ' '.repeat( skip );
      line += hex;
    }
    return line;
  }
  ascii( data, base, width = 16 ) {
    let line = '';
    for ( let b = 0; b < width; b++ ) {
      let ch = ' ';
      if ( ( base + b ) < data.length ) {
        let v = data[ base + b ];
        ch = this.asc( v );
      }
      line += ch;
    }
    return line;
  }
  line( addr, data, base, width = 16, pattern = 8, addrSep = ' ', asciiSep = ' ' ) {
    let addrHex = this.wb( addr );
    //let addr = this.w( base );
    let bytes = this.bytes( data, base, width, pattern );
    let ascii = this.ascii( data, base, width );
    return addrHex + addrSep + bytes + asciiSep + ascii;
  }
  lines( addr, data, base, rows, width = 16, pattern = 3, addrSep = '  ', asciiSep = '  ' ) {
    let lf = '\r\n';
    let lines = '';
    for ( let l = 0; l < rows; l++ ) {
      lines += l != 0 ? lf : '' ;
      lines += this.line( addr, data, base, width, pattern, addrSep, asciiSep );
      addr += width;
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

initHex();

module.exports = Hex;

