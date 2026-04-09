
// Copyright (C) 2026 Brian Sheldon
//
// MIT License

class Cpu80Reg {
  constructor( cpu, z80 ) {
    this.cpu = cpu;
    this.z80 = z80;
    this.initColors();
  }
  initColors() {
    this.sc = '\x1b[1;34m';
    this.hc = '\x1b[1;31m';
    this.rc = '\x1b[1;33m';
  }
  list() {
    let list = [
      'pc','sp',
      'a','f','b','c','d','e','h','l',
      'af','bc','de','hl','af_','bc_','de_','hl_',
      'ix','iy','ir','iff1','iff2'
    ];
  }
  get() {
    return this.cpu.get();
  }
  set( reg, v ) {
  }
  //
  get reg() { return this; }
  //
  get pc() { return this.cpu.get().pc; }
  set pc( v ) { this.cpu.set( 'pc', v ); }
  //
  get sp() { return this.cpu.get().sp; }
  set sp( v ) { this.cpu.set( 'sp', v ); }
  //
  get a() { return this.cpu.get().a; }
  set a( v ) { this.cpu.set( 'a', v ); }
  //
  get f() { return this.cpu.get().f; }
  set f( v ) { this.cpu.set( 'f', v ); }
  //
  get b() { return this.cpu.get().b; }
  set b( v ) { this.cpu.set( 'b', v ); }
  //
  get c() { return this.cpu.get().c; }
  set c( v ) { this.cpu.set( 'c', v ); }
  //
  get d() { return this.cpu.get().d; }
  set d( v ) { this.cpu.set( 'd', v ); }
  //
  get e() { return this.cpu.get().e; }
  set e( v ) { this.cpu.set( 'e', v ); }
  //
  get h() { return this.cpu.get().h; }
  set h( v ) { this.cpu.set( 'h', v ); }
  //
  get l() { return this.cpu.get().l; }
  set l( v ) { this.cpu.set( 'l', v ); }
  //
  get af() { return  this.a << 8 | this.f; }
  set af( v ) {
    this.cpu.set( 'a', v >> 8 );
    this.cpu.set( 'f', v & 0xff );
  }
  //
  get bc() { return  this.b << 8 | this.c; }
  set bc( v ) {
    this.b = v >> 8;
    this.c = v & 0xff;
  }
  //
  get de() { return  this.d << 8 | this.e; }
  set de( v ) {
    this.d = v >> 8;
    this.e = v & 0xff;
  }
  //
  get hl() { return  this.h << 8 | this.l; }
  set hl( v ) {
    this.h = v >> 8;
    this.l = v & 0xff;
  }
  //
  get af_() { return this.z80 ? this.cpu.get().af_ : 0 ; }
  set af_( v ) { if ( this.z80 ) this.cpu.set( 'af_', v ); }
  //
  get bc_() { return this.z80 ? this.cpu.get().bc_ : 0 ; }
  set bc_( v ) { if ( this.z80 ) this.cpu.set( 'bc_', v ); }
  //
  get de_() { return this.z80 ? this.cpu.get().de_ : 0 ; }
  set de_( v ) { if ( this.z80 ) this.cpu.set( 'de_', v ); }
  //
  get hl_() { return this.z80 ? this.cpu.get().hl_ : 0 ; }
  set hl_( v ) { if ( this.z80 ) this.cpu.set( 'hl_', v ); }
  //
  get ix() { return this.z80 ? this.cpu.get().ix : 0 ; }
  set ix( v ) { if ( this.z80 ) this.cpu.set( 'ix', v ); }
  //
  get iy() { return this.z80 ? this.cpu.get().iy : 0 ;; }
  set iy( v ) { if ( this.z80 ) this.cpu.set( 'iy', v ); }
  //
  get ir() { return this.z80 ? this.cpu.get().ir : 0 ; }
  set ir( v ) { if ( this.z80 ) this.cpu.set( 'ir', v ); }
  //
  get iff1() { return this.z80 ? this.cpu.get().iff1 : 0; }
  set iff1( v ) { if ( this.z80 ) this.cpu.set( 'iff1', v ); }
  //
  get iff2() { return this.z80 ? this.cpu.get().iff2 : 0 ; }
  set iff2( v ) { if ( this.z80 ) this.cpu.set( 'iff2', v ); }
  //
  get flag() {
    let f = this.f;
    let flag = {};
    flag.s  = ( f & 0x80 ) >> 7;
    flag.z  = ( f & 0x40 ) >> 6;
    flag.u5 = ( f & 0x20 ) >> 5;
    flag.h  = ( f & 0x10 ) >> 4;
    flag.u3 = ( f & 0x08 ) >> 3;
    flag.p  = ( f & 0x04 ) >> 2;
    flag.n  = ( f & 0x02 ) >> 1;
    flag.c  = ( f & 0x01 ) >> 0;
    return flag;
  }
  hex2( v ) {
    return v;
  }
  chex1( v ) {
    let hc = '\x1b[1;31m';
    let rc = '\x1b[1;32m';
    return hc + this.hex2( v ) + rc;
  }
  chex2( v ) {
    let hc = '\x1b[1;31m';
    let rc = '\x1b[1;32m';
    return hc + this.hex2( v ) + rc;
  }
  chex4( v ) {
    let hc = '\x1b[1;31m';
    let rc = '\x1b[1;32m';
    return v;
  }
  state() {
    let sc = '\x1b[1;34m';
    let hc = '\x1b[1;31m';
    let rc = '\x1b[1;33m';
    sc = this.sc;
    hc = this.hc;
    rc = this.rc;
    //let hex1 = this.chex1;
    let hex1 = this.hex1;
    let hex2 = this.hex2;
    let hex4 = this.hex4;
    let reg = this.reg;
    let pc = hex4( reg.pc );
    let sp = hex4( reg.sp );
    let af = hex4( reg.af );
    let bc = hex4( reg.bc );
    let de = hex4( reg.de );
    let hl = hex4( reg.hl );
    let  a = hex2( reg.a );
    let  f = hex2( reg.f );
    let na = hc + '____';
    let na1 = hc + '_';
    let af_ = na;
    let bc_ = na;
    let de_ = na;
    let hl_ = na;
    let ir = na;
    let ix = na;
    let iy = na;
    let iff1 = na1;
    let iff2 = na1;
    let flag = reg.flag;
    if ( this.z80 ) {
      af_ = hex4( reg.af_ );
      bc_ = hex4( reg.bc_ );
      de_ = hex4( reg.de_ );
      hl_ = hex4( reg.hl_ );
      ir = hex4( reg.ir );
      ix = hex4( reg.ix );
      iy = hex4( reg.iy );
      iff1 = hex1( reg.iff1 & 0x01 );
      iff2 = hex1( reg.iff2 & 0x01 );
    }
    let sep = sc + ' | ' + rc;
    let s = rc + '';
    // state line 1 pc af flags af_
    s += 'PC '  + pc  + sep;
    s += 'SP '  + sp  + ' ';
    s += 'A '   +  a  + ' ';
    s += 'F '   +  f  + '    ' + sep;
    s += 'AF_ ' + af_ + sep;
    //s += '' + memln1;
    s += '\r\n';
    // state line 2 bc sp flags bc_
    s += 'BC '  + bc  + sep;
    s += 'IR '  + ir  + ' ';
    s += 's ' + hex1( flag.s ) + '  z '  + hex1( flag.z ) + '  h ' + hex1( flag.h ) + sep;
    s += 'BC_ ' + bc_ + sep;
    //s += '' + memln2;
    s += '\r\n';
    // state line 3 de ix ir de_
    s += 'DE '   + de  + sep;
    s += 'IX '   + ix  + ' ';
    s += 'p ' + hex1( flag.p ) + '  n ' + hex1( flag.n ) + '  c ' + hex1 ( flag.c ) + sep;
    s += 'DE_ '  + de_ + sep;
    //s += '' + memln3;
    s += '\r\n';
    // state line 4 hl iy hl_
    s += 'HL '   + hl  + sep;
    s += 'IY '   + iy  + ' ';
    s += 'iff1 ' + hex1( iff1 ) + ' iff2 ' + hex1( iff2 ) + sep;
    s += 'HL_ '  + hl_ + sep;
    //s += '' + memln4;
    //s += '\n';
    // state line 5 ts ops
    /*
    s += 'run ' + Number( this.state.running );
    s += ' wait ' + Number( this.state.coninWait );
    s += ' stop ' + Number( this.state.stop );
    s += ' halt ' + Number( this.state.halted );
    s += ' ts ' + ticks;
    s += '   op ' + ops;
    */
    return s;
  }
  //
  hex1( v, self = null ) {
    let h =  v.toString( 16 ).padStart( 1, '0' );
    let hc = '\x1b[1;31m';
    let rc = '\x1b[1;33m';
    if ( self != null ) {
      hc = self.hc;
      rc = self.rc;
    }
    return hc + h + rc;
  }
  hex2( v, self = null ) {
    let h =  v.toString( 16 ).padStart( 2, '0' );
    let hc = '\x1b[1;31m';
    let rc = '\x1b[1;33m';
    if ( self != null ) {
      hc = self.hc;
      rc = self.rc;
    }
    return hc + h + rc;
  }
  hex4( v, self = null ) {
    let h =  v.toString( 16 ).padStart( 4, '0' );
    let hc = '\x1b[1;31m';
    let rc = '\x1b[1;33m';
    if ( self != null ) {
      hc = self.hc;
      rc = self.rc;
    }
    return hc + h + rc;
  }
  rand8() {
    return Math.floor( Math.random() * 0x100 );
  }
  rand16() {
    return Math.floor( Math.random() * 0x10000 );
  }
  // tests
  testRegs() {
    this.reg.pc = this.rand16();
    this.reg.sp = this.rand16();
    this.reg.af_ = this.rand16();
    this.reg.bc_ = this.rand16();
    this.reg.de_ = this.rand16();
    this.reg.hl_ = this.rand16();
    this.reg.ix = this.rand16();
    this.reg.iy = this.rand16();
    this.reg.ir = this.rand16();
    this.reg.a = this.rand8();
    this.reg.f = this.rand8();
    this.reg.b = this.rand8();
    this.reg.c = this.rand8();
    this.reg.d = this.rand8();
    this.reg.e = this.rand8();
    this.reg.h = this.rand8();
    this.reg.l = this.rand8();
    this.reg.iff1 = this.rand8();
    this.reg.iff2 = this.rand8();
  }
  testRegs2() {
    this.reg.pc = 0x1234;
    this.reg.sp = 0x2345;
    this.reg.af = 0x3456;
    this.reg.bc = 0x4567;
    this.reg.de = 0x5678;
    this.reg.hl = 0x6789;
    this.reg.af_ = 0x3456;
    this.reg.bc_ = 0x4567;
    this.reg.de_ = 0x5678;
    this.reg.hl_ = 0x6789;
    this.reg.ix = 0x7890;
    this.reg.iy = 0x1234;
    this.reg.ir = 0x2345;
    this.reg.iff1 = 0x87;
    this.reg.iff2 = 0x65;
  }
  testRegs3() {
    this.reg.a = 0x43;
    this.reg.f = 0x21;
    this.reg.b = 0x54;
    this.reg.c = 0x32;
    this.reg.d = 0x65;
    this.reg.e = 0x43;
    this.reg.h = 0x76;
    this.reg.l = 0x54;
  }
}

if ( typeof window !== 'object' ) {
  module.exports = Cpu80Reg;
}


