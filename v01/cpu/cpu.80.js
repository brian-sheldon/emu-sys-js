//
// cpu.80.js
//
// Copyright 2025 - Brian Sheldon
//

let CpuBase = require( './cpu.base.js' );
let Cpu80Reg = require( './cpu.80.reg.js' );
let CpuTrace = require( './cpu.trace.js' );

let Sim8080 = require( './8080/sim8080.js' );
let JS8080 = require( './8080/js8080.js' );
let Z80 = require( './z80/z.op.js' );
let Z80Dis = require( './z80/z.dis.js' );

let fs = require( 'fs' );

class Cpu80 extends CpuBase {
  constructor( isZ80 = false, sys = null ) {
    super();
    if ( sys == null ) {
      this._sys = this;
    } else {
      this._sys = sys;
    }
    this.isZ80 = isZ80;
    if ( this.isZ80 ) {
      console.log( 'isZ80' );
      this.memInit();
      this.cpu = new Z80( this );
      this.z80init();
    } else {
      this.memInit();
      this.cpu = Sim8080;
      this.sim8080init();
    }
    this.js8080 = new JS8080( this );
    this.z80dis = Z80Dis;
    this._reg = new Cpu80Reg( this.cpu, this.isZ80 );
    this._trace = new CpuTrace( this );
    console.log( 'pc: ' + this.reg.pc );
    this.initState();
    //this.steps = this.steps.bind( this );
    //this.rd = this.rd.bind( this );
    //this.wr = this.wr.bind( this );
  }
  sim8080init() {
    let self = this;
    this.cpu.init(
      function( addr, b ) { self.wr( addr, b ); },
      function( addr )    { return self.rd( addr ); },
      function() {},
      function( port, b ) { self.out( port,b ); },
      function( port )    { return self.inp( port ); }
   );
  }
  z80init() {
  }
  //
  // Memory
  //
  memInit() {
    this.memSize = 0x10000;
    this.memMask = 0xffff;
    this._mem = new Uint8Array( this.memSize );
    this.memFill( 0x00 );
    this._mem[ 0 ] = 0;
    this.loadBin( 'roms/model1.rom', 0x0000 );
    // hack the basic rom
    this._mem[ 0x33 ] = 0xd3; // out (1),a
    this._mem[ 0x34 ] = 0x01;
    this._mem[ 0x35 ] = 0xfe; // cp 0d
    this._mem[ 0x36 ] = 0x0d;
    this._mem[ 0x37 ] = 0xc0; // ret nz
    this._mem[ 0x38 ] = 0x3e; // ld a,0a
    this._mem[ 0x39 ] = 0x0a;
    this._mem[ 0x3a ] = 0xd3; // out (1),a
    this._mem[ 0x3b ] = 0x01;
    this._mem[ 0x3c ] = 0xc9; // ret
    this._mem[ 0x49 ] = 0xdb; // in a,(01)
    this._mem[ 0x4a ] = 0x01;
    this._mem[ 0x4b ] = 0xc9; // ret
    //this.loadBin( 'roms/forth.bin', 0x8000 );
  }
  memFill( b = 0x00 ) {
    this._mem.fill( b );
  }
  loadBin( path, start ) {
    let data = fs.readFileSync( path );
    for ( let i = 0; i < data.length; i++ ) {
      let addr = start + i;
      let byt = data[ i ];
      this._mem[ addr ] = byt;
    }
  }
  //
  // Cpu
  //
  whoami() {
    return "I am Cpu80 ...";
  }
  reset() {
    this.cpu.reset(
    );
  }
  ticks() {
    return this.cpu.T();
  }
  // registers
  get reg() {
    return this._reg;
  }
  // memory
  // - ram for js8080 disassembler
  get mem() {
    return this._mem;
  }
  get ram() {
    return this._mem;
  }
  // trace
  get trace() {
    return this._trace;
  }
  //
  get sys() {
    return this._sys;
  }
  //
  get() {
    return this.cpu.get();
  }
  // control
  get state() {
    return this._state;
  }
  get cpuTrace() {
    return this._cpuTrace;
  }
  get rdTrace() {
    return this._rdTrace;
  }
  get wrTrace() {
    return this._wrTrace;
  }
  get rwsTrace() {
    return this._rws.length;
  }
  initState() {
    this._state = {}
    //
    this.state.totaltime = 0;
    this.state.time = 0;
    this.state.t = 0;
    this.state.mhz = 0;
    this.state.mhzmin = 1000.0;
    this.state.mhzmax = 0.0;
    this.state.ticks = 0;
    this.state.steps = 0;
    //
    this.state.trace = true;
    this.state.running = true;
    // The reasons for not running
    this.state.on = false;
    this.state.stopaddr = -1;
    this.state.stopat = false;
    this.state.halted = false;
    this.state.coninwait = false;
    this.traceInit();
  }
  labelValStr( label, value, sep = ' ' ) {
    let lcolor = '\x1b[1;33m';
    let vcolor = '\x1b[1;35m';
    let rcolor = '';
    return lcolor + label + sep + vcolor + value + rcolor;
  }
  stateStr() {
    let s = '';
    let lf = '';
    for ( let key in this.state ) {
      let val = this.state[ key ];
      s += lf + this.labelValStr( key, val, ': ' );
      lf = '\n'
    }
    return s;
  }
  dis( addr ) {
    //let pc = this.reg.pc;
    //let dis = this.js8080.dis1( addr );
    let dis = this.z80dis.dis1( this.mem, addr );
    //let nextpc = dis[0];
    //let bytes = dis[1];
    //let instruction = dis[2];
    return dis;
  }
  disLine( addr, prefix = '', sep1 = '  ', sep2 = ' ', sep3 = '  ' ) {
    let dis = this.dis( addr );
    let sep = '';
    let s = '';
    s += prefix;
    s += addr.toString( 16 ).padStart( 4, '0' );
    s += sep1;
    for ( let i = 0; i < 5; i++ ) {
      s += sep;
      if ( i < dis[1].length ) {
        let byt = dis[1][ i ];
        s += byt.toString( 16 ).padStart( 2, '0' );
      } else {
        s += '  ';
      }
      sep = sep2;
    }
    s += sep3;
    s += dis[2];
    let nextaddr = addr + dis[1].length;
    return [ nextaddr, s ];
  }
  disLines( n, addr, prefix = '', sep1 = '  ', sep2 = ' ', sep3 = '  ' ) {
    let s = '';
    let lf = '';
    let nextaddr, line;
    nextaddr = addr;
    for ( let i = 0; i < n; i++ ) {
      s += lf;
      [ nextaddr, line ] = this.disLine( nextaddr, prefix, sep1, sep2, sep3 );
      s += line;
      lf = '\n';
    }
    return [ nextaddr, s ];
  }
  runState() {
    let s = '';
    s += this.labelValStr(  'running ', Number( this.state.running ) );
    s += ' | ';
    s += this.labelValStr(  'on', Number( this.state.on ) );
    s += this.labelValStr( ' wait', Number( this.state.coninwait ) );
    s += this.labelValStr( ' stop', Number( this.state.stopat ) );
    s += this.labelValStr( ' halt', Number( this.state.halted ) );
    return s;
  }
  tickState() {
    let s = '';
    s += this.labelValStr(  'ticks', this.state.ticks );
    s += this.labelValStr( ' steps', this.state.steps );
    return s;
  }
  mhzState() {
    let s = '';
    s += this.labelValStr(  'mhz min', this.state.mhzmin.toFixed( 1 ) );
    s += this.labelValStr( ' max', this.state.mhzmax.toFixed( 1 ) );
    return s;
  }
  traceInit() {
    let size = 0x10000;
    this._rdTrace = new Uint16Array( size );
    this._wrTrace = new Uint16Array( size );
    this._cpuTrace = new Uint16Array( size );
    this._rws = [];
    this.memTraceClr();
    this.cpuTraceClr();
  }
  cpuTraceClr() {
    this._cpuTrace.fill( 0x00 );
  }
  memTraceClr() {
    this._rdTrace.fill( 0x00 );
    this._wrTrace.fill( 0x00 );
  }
  step() {
    return this.steps( 1 );
  }
  steps( n = 1 ) {
    let ticks = 0;
    let steps = 0;
    let beg = performance.now();
    while ( this.state.running && ( ticks < n ) ) {
      let pc = this.reg.pc;
      if ( pc == this.state.stopaddr ) {
        this.state.stopat = true;
        this.state.running = false;
      } else {
        let t = this.cpu.step();
        if ( t == 1 ) {
          this.state.halted = true;
          this.state.running = false;
        } else {
          ticks += t;
          steps++;
          if ( this.state.trace ) {
            let cc = this._cpuTrace[ pc ]; // ? this._cpuTrace[ pc ] : 0 ;
            this._cpuTrace[ pc ] = cc < 0xffff ? cc + 1 : cc ;
          }
        }
      }
    }
    let end = performance.now();
    let time = end - beg;
    let mhz = ( ticks / ( time / 1000 ) ) / 1000000;
    this.state.totaltime += time;
    this.state.time = time;
    this.state.t = ticks;
    this.state.mhz = mhz;
    if ( ticks > 10000 ) {
      this.state.mhzmin = Math.min( mhz, this.state.mhzmin );
      this.state.mhzmax = Math.max( mhz, this.state.mhzmax );
    }
    this.state.ticks += ticks;
    this.state.steps += steps;
    return ticks;
  }
  viewSteps( n ) {
    let ticks = 0;
    if ( n == 0 ) {
      console.log( this.reg.state() );
    } else {
      for ( let i = 0; i < n; i++ ) {
        ticks += this.step();
        console.log( this.reg.state() );
      }
    }
    return ticks;
  }
  start() {
  }
  stop() {
  }
  // memory
  rd( addr ) {
    if ( this.state.trace ) {
      //this._rws.push( [ 0, addr ] );
      let rd = this._rdTrace[ addr ];
      this._rdTrace[ addr ] = rd != 0xffff ? rd + 1 : rd ;
    }
    return this.mem[ addr & 0xffff ] & 0xff;
  }
  wr( addr, b ) {
    if ( this.state.trace ) {
      //this._rws.push( [ 1, addr ] );
      let wr = this._wrTrace[ addr ];
      this.wrTrace[ addr ] = wr != 0xffff ? wr + 1 : wr ;
    }
    this.mem[ addr & 0xffff ] = b & 0xff;
  }
  // io
  inp( port ) {
    return this.sys.input( port );
  }
  out( port, b ) {
    this.sys.output( port, b );
  }
  input( b ) {
    return 0xff;
  }
  output( port, b ) {
    console.log( port, b );
  }
}

if ( false ) {
  console.log( process.argv );

  let z80 = parseInt( process.argv[2] );
  let cpu = new Cpu80( z80 );
  
  console.log( 'Cycles', cpu.steps( 10000 ) );
  console.log( cpu.reg.state() );
  //console.log( cpu.memDump( cpu.mem, 0x3c00, 32, 16 ) );

  //console.log( cpu.reg.state() );
}

if ( typeof window !== 'object' ) {
  module.exports = Cpu80;
}

