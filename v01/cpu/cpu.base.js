
// Copyright (C) 2026 Brian Sheldon
//
// MIT License


class CpuBase {
  constructor() {
  }
  hex2( v ) {
    return v.toString( 16 ).padStart( 2, '0' );
  }
  hex4( v ) {
    return v.toString( 16 ).padStart( 4, '0' );
  }
  rand16() {
    return Math.floor( Math.random() * 0x10000 );
  }
  rand8() {
    return Math.floor( Math.random() * 0x100 );
  }
  //
  // Memory
  //
  memInit() {
    this.memSize = 0x10000;
    this.memMask = 0xffff;
    this._mem = new Uint8Array( this.memSize );
    this.memFill( 0x35 );
  }
  memFill( b = 0x00 ) {
    this._mem.fill( b );
  }
  memDumpLine( mem, addr, cols = 16 ) {
    let spacer = '  ';
    let line = this.hex4( addr ) + spacer;
    let chrs = '';
    for ( let i = 0; i < cols; i++ ) {
      line += i > 0 && ( ( i % 2 ) == 0 ) ? ' ' : '' ;
      let byt = mem[ addr + i ];
      let ch = String.fromCharCode( byt );
      line += this.hex2( byt );
      chrs += byt >= 0x20 && byt <= 0x7e ? ch : '.' ;
    }
    line += spacer + chrs;
    return line;
  }
  memDump( mem, addr, rows = 8, cols = 16 ) {
    let lines = '';
    for ( let i = 0; i < rows; i++ ) {
      lines += i > 0 ? '\n' : '' ;
      lines += this.memDumpLine( mem, addr, cols );
      addr += cols;
    }
    return lines;
  }
}

if ( typeof window !== 'object' ) {
  module.exports = CpuBase;
}



