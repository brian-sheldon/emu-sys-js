
// Copyright (C) 2026 Brian Sheldon
//
// MIT License

if ( typeof window !== 'object' ) {
  global.fs = require( 'fs' );
  global.JS8080 = require( './8080/js8080.js' );
}

class CpuTrace {
  constructor( cpu ) {
    this.cpu = cpu;
    this.js8080 = new JS8080( this.cpu, function () {} );
  }
  getPath() {
    let path = 'log/trace/';
    let prefix = path + this.getDateString() + '.';
    return prefix;
  }
  getDateString() {
    let now = new Date();
    let year = now.getFullYear();
    let month = String( now.getMonth() + 1 ).padStart( 2, '0' );
    let day = String( now.getDate() ).padStart( 2, '0' );
    return year + '-' + month + '-' + day;
  }
  // Interface to Low Level Trace Functions
  memTraceClr() {
    this.cpu.memTraceClr();
  }
  cpuTraceClr() {
    this.cpu.cpuTraceClr();
  }
  // High level Trace Functions
  memTraceSave( name = 'test' ) {
    let path = this.getPath() + 'mem.' + name + '.txt';
    let s = this.memTraceList();
    fs.writeFileSync( path, s, 'utf8'  );
    return path;
  }
  cpuTraceSave( name = 'test' ) {
    let path = this.getPath() + 'cpu.' + name + '.txt';
    let s = this.cpuTraceList();;
    fs.writeFileSync( path, s, 'utf8'  );
    return path;
  }
  memTraceArray() {
    let addrs = [];
    for ( let i = 0; i < 65536; i++ ) {
      let rd = this.cpu.rdTrace[ i ];
      let wr = this.cpu.wrTrace[ i ];
      let rw = rd + wr;
      if ( rw != 0 ) {
        addrs.push( i );
      }
    }
    return addrs;
  }
  // gets from sys
  cpuTraceArray() {
    let steps = [];
    for ( let i = 0; i < 65536; i++ ) {
      if ( this.cpu.cpuTrace[i] != 0 ) {
        steps.push( i );
      }
    }
    return steps;
  }
  // get from this
  memTraceString() {
    let s = '';
    let steps = this.memTraceArray();
    for ( let i in steps) {
      let pc = steps[ i ];
      s += emu.hex.w( pc ) + ' ';
      s += ( i % 8 ) == 0 ? '\r\n' : '' ;
    }
    s += 'step addresses: ' + steps.length;
    return s;
  }
  cpuTraceString() {
    let s = '';
    let steps = this.cpuTraceArray();
    for ( let i in steps) {
      let pc = steps[ i ];
      s += emu.hex.w( pc ) + ' ';
      s += ( i % 8 ) == 0 ? '\r\n' : '' ;
    }
    s += 'step addresses: ' + steps.length;
    return s;
  }
  // get from sys and this
  memTraceList() {
    let hex = emu.hex;
    let lf = '';
    let s = '';
    let inst = 0;
    let ops = 0;
    let trd = 0;
    let twr = 0;
    let trw = 0;
    let nextpc = 0xffff;
    let steps = this.memTraceArray();
    for ( let i in steps) {
      let pc = steps[ i ];
      let rd = this.cpu.rdTrace[ pc ];
      let wr = this.cpu.wrTrace[ pc ];
      let rw = rd + wr;
      inst++;
      trd += rd;
      twr += wr;
      trw += rw;
      s += lf;
      if ( nextpc != pc ) {
        s += '      pc' + emu.hex.w(pc) + ':\r\n';
      }
      //let sa = this.js8080.disassemble1( pc );
      //nextpc = sa[ 0 ];
      nextpc = pc + 1;
      let byt = this.cpu.mem[ pc ];
      let ch = byt > 0x20 && byt <= 0x7e ? String.fromCharCode( byt ) : '.' ;
      s += hex.w( rw, ' ' );
      s += '  ' + hex.w( pc );
      s += ' ' + hex.b( byt );
      s += ' ' + ch;
      s += '  rd: ' + hex.w( rd, ' ' );
      s += '  wr: ' + hex.w( wr, ' ' );
      //s += sa[ 1 ];
      lf = '\r\n';
    }
    s += lf + 'addresses: ' + inst + '  ' + trw  + '  rd: ' + trd + '   wr: ' + twr;
    return s;
  }
  // gets from sys and this
  cpuTraceList() {
    let hex = emu.hex;
    let lf = '';
    let s = '';
    let inst = 0;
    let ops = 0;
    let nextpc = 0xffff;
    let steps = this.cpuTraceArray();
    for ( let i in steps) {
      let pc = steps[ i ];
      let iops = this.cpu.cpuTrace[ pc ];
      inst++;
      ops += iops;
      s += lf;
      if ( nextpc != pc ) {
        s += '      pc' + emu.hex.w(pc) + ':\r\n';
      }
      let sa = this.js8080.disassemble1( pc );
      nextpc = sa[ 0 ];
      s += hex.w( iops, ' ' ) + '  ';
      s += sa[ 1 ];
      lf = '\r\n';
    }
    s += lf + 'inst: ' + inst + '   ops: ' + ops ;
    return s;
  }
}

if ( typeof window !== 'object' ) {
  module.exports = CpuTrace;
}

