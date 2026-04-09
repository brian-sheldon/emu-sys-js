

class EmuLed {
  constructor() {
    this.resetColors = '\x1b[0m';
    this.borderBgColor = '\x1b[47m';
    this.ledBgColor = '\x1b[40m';
    this.ledSegOnColor = '\x1b[0;31m';
    this.ledSegOffColor = '\x1b[0;30m';
    this.ledLineOnColor = '\x1b[1;32m';
    this.ledLineOffColor = '\x1b[1;30m';
    this.hseg = '\u2501';
    this.hseg += this.hseg;
    this.vseg = '\u2503';
    this.dot = '\u2b24' //'\u25cf';
    // alternatives for dot  2022, 2511 25a1 25fe 25fc 25cf
  }
  hex2num( ch ) {
    let num = - 1;
    ch = ch.toUpperCase();
    let cc = ch.charCodeAt( 0 );;
    if ( cc >= 0x30 && cc <= 0x39 ) {
      num = cc - 0x30;
    }
    if ( cc >= 0x41 && cc <= 0x46 ) {
      num = cc - 0x41 + 10;
    }
    return num;
  }
  ledLine( num ) {
    let line = '';
    for ( let i = 0; i < 4; i++ ) {
      let bit = ( num >> ( 3 - i ) ) & 1;
      line += this.onoff( bit, false ) + this.dot;
    }
    return line;
  }
  onoff( on, seg = true ) {
    if ( on ) {
      if ( seg ) {
        return this.ledSegOnColor;
      } else {
        return this.ledLineOnColor;
      }
    } else {
      if ( seg ) {
        return this.ledSegOffColor;
      } else {
        return this.ledLineOffColor;
      }
    }
  }
  hline( seg, dot = false ) {
    let line = ' ' + this.onoff( seg )  + this.hseg + ' ';
    line += this.resetColors;
    return line;
  }
  vline( left, right ) {
    let line = '';
    line += this.onoff( left ) + this.vseg;
    line += '  ';
    line += this.onoff( right ) + this.vseg;
    line += this.resetColors;
    return line;
  }
  getlines( a, b, c, d, e, f, g, dot ) {
    let beg = ' ';
    let end = ' ';
    dot = this.onoff( dot ) + this.dot;
    let lines = [];
    lines[0] = beg + this.hline( a ) + end;
    lines[1] = beg + this.vline( f, b ) + end;
    lines[2] = beg + this.hline( g ) + end;
    lines[3] = beg + this.vline( e, c ) + end;
    lines[4] = beg + this.hline( d ) + dot;
    return lines;
  }
  lines( bits, dot ) {
    let a = bits >> 7 & 1;
    let b = bits >> 6 & 1;
    let c = bits >> 5 & 1;
    let d = bits >> 4 & 1;
    let e = bits >> 3 & 1;
    let f = bits >> 2 & 1;
    let g = bits >> 1 & 1;
    let lines = this.getlines( a, b, c, d, e, f, g, dot );
    return lines;
  }
  getBits( digit, dot = false ) {
    let digits = [ 0b11111100,
               0b01100000, 0b11011010, 0b11110010,
               0b01100110, 0b10110110, 0b10111110,
               0b11100000, 0b11111110, 0b11100110,
               0b11101110, 0b00111110, 0b10011100,
               0b01111010, 0b10011110, 0b10001110 ];
    let bits = digits[ digit ];
    return bits;
  }
  border( width ) {
    let border = this.borderBgColor + ' '.repeat( width ) + this.resetColors;
    return border;
  }
  drawLine( s ) {
    let led = '';
    let width = 0;
    let ledline = this.borderBgColor + '  ';
    let lines = [];
    let out = Array(5).fill( '' );
    for ( let ci = 0; ci < s.length; ci++ ) {
      let ch = s.charAt(ci).toUpperCase();
      let num = this.hex2num( ch );
      if ( num >= 0 ) {
        width += 6;
        let dot = 0;
        let bits = this.getBits( num );
        lines = this.lines( bits, dot );
        ledline += ' ' + this.ledLine( num ) + ' ';
      } else {
        width += 2;
        lines = Array(5).fill( this.border( 2 ) );
        ledline += '  ';
      }
      for ( let l in lines ) {
        let line = lines[l];
        out[ l ] += '\x1b[40;1m' + line + '\x1b[0;40m';
      }
    }
    ledline += '  ' + this.resetColors;
    let hborder = this.border( width + 4 );
    let vborder = this.border( 2 );
    led += ledline + '\n';
    for ( let l in out ) {
      let line = out[ l ];
      led += vborder + line + vborder + '\n';
    }
    led += hborder + '\n';
    return led;
  }
}

if ( typeof window !== 'object' ) {
  module.exports = EmuLed;
}



