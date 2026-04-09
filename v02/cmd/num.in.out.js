
// Copyright (C) 2026 Brian Sheldon
//
// MIT License


//
// A collection of utils to handle parsing of numbers for input and
// formatting of numbers for output, plus validity checking.
//
// Include the following conventions for input.
// - hex  prefix with $, 0x
// - oct  prefix with 0o, 0q
// - bin  prefix with %, 0b
// - dec  prefix with #
//        Used when default with no prefix is hex as the only way
//        to specify decimal is to make it default and we want hex
//        to be the default in a lot of debuggers/monitors
// Note: - sign comes before the prefix unless it begins with #
//

function initNumInOutGlobals() {
  let numio = new NumInOut();
  global.pnum = function( s, defRadix = 16 ) {
    return numio.parse( s, defRadix );
  }
}

class NumInOut {
  constructor() {
  }
  isValid( s, radix ) {
    let isValid = false;
    switch ( radix ) {
      case 2:
        isValid = /^[0-1]+$/i.test( s );
        break;
      case 8:
        isValid = /^[0-7]+$/i.test( s );
        break;
      case 10:
        isValid = /^[0-9]+$/i.test( s );
        break;
      case 16:
        isValid = /^[0-9a-f]+$/i.test( s );
        break;
    }
    return isValid;
  }
  hex0( v, w = 0, ch = '0', fmt = 'xxxx_xxxx_xxxx_xxxx' ) {
    let h = v.toString( 16 ).padStart( w, ch );
    return h;
  }
  dec0( v, w = 0, ch = '0', fmt = 'ddd,ddd,ddd,ddd' ) {
    let d = v.toString().padStart( w, ch );
    return d;
  }
  oct0( v, w = 0, ch = '0', fmt = 'ooo_ooo_ooo_ooo' ) {
    let o = v.toString( 8 ).padStart( w, ch );
    return o;
  }
  bin0( v, w = 0, ch = '0', fmt = 'bbbb_bbbb_bbbb_bbbb' ) {
    let b = v.toString( 2 ).padStart( w, ch );
    return b;
  }
  parse( s, radix = 16 ) {
    let pstr = [
      '0x', '$', '0b', '%', '0o', '0q', ''
    ];
    if ( s[0] == '#' ) {
      radix = 10;
      s = s.slice( 1 );
    }
    s = s.trim().toLowerCase();
    let sign = '';
    if ( s[0] == '-' ) {
      sign = '-';
      s = s.slice( 1 );
    }
    let found = pstr.find( keyword => s.includes( keyword ) );
    //console.log( found );
    if ( s.indexOf( found ) == 0 ) {
      s = s.slice( found.length );
    }
    switch ( found ) {
      // bin
      case '0b':
      case '%':
        radix = 2;
        break;
      // oct
      case '0o':
      case '0q':
        radix = 8;
        break;
      // hex
      case '0x':
      case '$':
        radix = 16;
        break;
      // hex or dec, whatever was set before switch
      default:
        break;
    }
    s = s.replaceAll( '_', '' );
    if ( this.isValid( s, radix ) ) {
      s = sign + s;
      let v = parseInt( s, radix );
      return v;
    } else {
      return 'NaN';
    }
  }
  line( v ) {
    let hex = this.hex0( v );
    let dec = this.dec0( v );
    let oct = this.oct0( v );
    let bin = this.bin0( v );
    let line = 'hex: ' + hex + ' dec: ' + dec + ' oct: ' + oct + ' bin: ' + bin;
    return line;
  }
}

initNumInOutGlobals();

module.exports = NumInOut;

