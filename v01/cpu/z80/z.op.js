
//
// Extracted from the emulator found at
//
//   https://trsjs.48k.ca/
//
// and written by 
//
//   Peter Phillips
//
// modified by Brian Sheldon
//


// z.op.js
// ========

/*
module.exports = {
  foo: function () {
    // whatever
    init();
  },
  testOps: function(z) {
    test(z);
  },
  z80: function () {
    // whatever
    return z80();
  },
  runCyc: function( z, cyc ) {
    runCyc( z, cyc );
  },
  runIns: function( z, ins ) {
    runIns( z, ins );
  },
  runz80: function(z) {
    runz80(z);
  },
  GetState: function() {
    return GetState();
  },
  getAF: function(z) {
    return getAF(z);
  },
  setAF: function(z,val) {
    setAF(z,val);
  }
};
*/

// Started at end

var op;
var opcb;
var oped;
var opx;
var opxcb;


const AutoInitEmu = false;

let _z80;

class Z80 {
  constructor( sys ) {
    this.sys = sys;
    init( sys.mem );
    this.z = z80();
    this.z.sys = sys;
    //this.initTrs80();
  }
  initCpm() {
  }
  initTrs80() {
    this.z.mem.fill( 0x00 );
    this.z.mem[ 0xfffd ] = 0x76;
  }
  get pc() {
    return this.z.reg.PC;
  }
  get reg() {
    return this.z.reg
  }
  w( n ) {
    return n.toString( 16 ).padStart( 4, '0' );
  }
  get() {
    let reg = this.z.reg;
    let r = {};
    r.pc = reg.PC;
    r.sp = reg.SP;
    r.a = getAF( this.z ) >> 8;
    r.f = getAF( this.z ) & 0xff;
    r.b = reg.BC >> 8;
    r.c = reg.BC & 0xff;
    r.d = reg.DE >> 8;
    r.e = reg.DE & 0xff;
    r.h = reg.HL >> 8;
    r.l = reg.HL & 0xff;
    r.af = getAF( this.z );
    r.bc = reg.BC;
    r.de = reg.DE;
    r.hl = reg.HL;
    r.af_ = reg.AFp;
    r.bc_ = reg.BCp;
    r.de_ = reg.DEp;
    r.hl_ = reg.HLp;
    r.ix = reg.IX;
    r.iy = reg.IY;
    r.ir = reg.I << 8 | reg.R;
    r.iff1 = reg.IFF1;
    r.iff2 = reg.IFF2;
    return r;
  }
  set( r, v ) {
    let high, low;
    let reg = this.z.reg;
    let o = {};
    switch ( r ) {
      case 'a':
        r = 'af';
        v = v << 8 | this.get().f;
        break;
      case 'f':
        r = 'af';
        v = this.get().a << 8 | v;
        break;
      case 'b':
        r = 'bc';
        v = v << 8 | this.get().c;
        break;
      case 'c':
        r = 'bc';
        v = this.get().b << 8 | v;
        break;
      case 'd':
        r = 'de';
        v = v << 8 | this.get().e;
        break;
      case 'e':
        r = 'de';
        v = this.get().d << 8 | v;
        break;
      case 'h':
        r = 'hl';
        v = v << 8 | this.get().l;
        break;
      case 'l':
        r = 'hl';
        v = this.get().h << 8 | v;
        break;
      case 'ir':
        r = 'I';
        low = v >> 8;
        o[r] = low;
        r = 'r';
        v = v & 0xff;
        break;
    }
    let R = r.toUpperCase();
    //r = r.replace( 'P', 'p' );
    o[R] = v;
    SetState( this.z, o );
  }
  regs() {
    let reg = this.z.reg;
    let hex = this;
    let s = '';
    s += 'PC : ' + hex.w( reg.PC ) + '  ';
    s += 'AF : ' + hex.w( getAF( this.z ) ) + '  ';
    s += 'AF.: ' + hex.w( reg.AFp ) + '\r\n';
    s += 'SP : ' + hex.w( reg.SP ) + '  ';
    s += 'BC : ' + hex.w( reg.BC ) + '  ';
    s += 'BC.: ' + hex.w( reg.BCp ) + '\r\n';
    s += '   : ' + hex.w( reg.PC ) + '  ';
    s += 'DE : ' + hex.w( reg.DE ) + '  ';
    s += 'DE.: ' + hex.w( reg.DEp ) + '\r\n';
    s += '   : ' + hex.w( reg.PC ) + '  ';
    s += 'HL : ' + hex.w( reg.HL ) + '  ';
    s += 'HL : ' + hex.w( reg.HLp ) + '\r\n';
    return s;
  }
  step() {
    let beg = this.z.cycles;
    stepz80( this.z );
    return beg - this.z.cycles;
  }

  setRegisters( params ) {
  }
  cpuStatus() {
  }
}

function z80() {
  return _z80;
}

function init(  mem) {
  build_ptable();
  build_all();
  let z = new z80cons( mem );
  _z80 = z;
  
  
  
  
  resetz80(z);
  
  z.z80timer = 1;
  
}

function qmon( z ) {
  let line;
  line = z.reg.BC+':'+z.reg.DE+':'+z.reg.HL+':'+z.reg.PC;
  console.log(line);
  line = z.mem[z.reg.PC]+':'+z.reg.IX+':'+z.reg.R;
  console.log(line);
}

function test(z) {
  //let z = _z80;
  for ( let opc = 0; opc < 256; opc++ ) {
    console.log( opc );
    qmon(z);
    try {
      op[opc](z);
    } catch(e) {
      console.log( e );
      break;
    }
  }
  
  for ( let opc = 0; opc < 256; opc++ ) {
    console.log( 'cb ' + opc );
    qmon(z);
    try {
      opcb[opc](z);
    } catch(e) {
      console.log( e );
      break;
    }
  }
  
  for ( let opc = 0; opc < 256; opc++ ) {
    console.log( 'ed ' + opc );
    qmon(z);
    try {
      oped[opc](z);
    } catch(e) {
      console.log( e );
      break;
    }
  }
  
  for ( let opc = 0; opc < 256; opc++ ) {
    console.log( 'dd ' + opc );
    qmon(z);
    try {
      opx[opc](z);
    } catch(e) {
      console.log( e );
      break;
    }
  }
  
  for ( let opc = 0; opc < 256; opc++ ) {
    console.log( 'ddcb ' + opc );
    qmon(z);
    try {
      opxcb[opc](z);
    } catch(e) {
      console.log( e );
      break;
    }
  }
}

//
// ********************
//

function stepz80(z)
{
    op[fetch_opcode(z)](z);
} // stepz80


function runCyc( z, cyc ) {
  z.cycles = cyc;
  while ( z.cycles >= 0 ) {
    op[fetch_opcode(z)](z);
  }
}

function runIns( z, ins ) {
  let instructions = ins;
  let begPC = z.reg.PC;
  let loop = 4000;
  while ( instructions > 0 && loop > 0 ) {
    begPC = z.reg.PC;
    op[fetch_opcode(z)](z);
    if ( begPC != z.reg.PC ) {
      instructions--;
    } else {
      loop--;
    }
  }
}

let perfCount = 0;
let perfCycles = 0;
let perf = 0;

function runz80(z) {
  let s = performance.now();
  perfCycles += z.cycles;
  //console.log(z.reg.PC);
  //console.log(z.mem[0]);
  while (z.cycles >= 0) {
    op[fetch_opcode(z)](z);
  }
  let e = performance.now();
  let d = e - s;
  perfCount++;
  perf += d;
  if ( perfCount >= 600 ) {
    //console.log( 'Perf: ' + perfCount + ' : ' + perfCycles + ' : ' + perf );
    perfCount = 0;
    perfCycles = 0;
    perf = 0;
  }
} // runz80

function startEmulator(z)
{
	stopEmulator(z);
	z.z80timer = setInterval(z.__frameDraw, 33);
	DebugEvent_running(z);
}

function stopEmulator(z)
{
	clearTimeout(z.z80timer);
}

function toggleEmu(z)
{
	z.doEmu ^= 1
}


function _RunStop(z, action)
{
	RunStop(z, action, true);
}

function _LoadOnly(z, action)
{
	RunStop(z, action, false);
}


function getAF(z)
{
return (z.reg.A << 8) | getF(z);
}



function getF(z)
{
	var res = 0 
 
	if (z.reg.fS ) res |= 0x80 
	if (z.reg.fZ ) res |= 0x40 
	if (z.reg.f5 ) res |= 0x20 
	if (z.reg.fH ) res |= 0x10 
	if (z.reg.f3 ) res |= 0x08 
	if (z.reg.fPV) res |= 0x04 
	if (z.reg.fN ) res |= 0x02 
	if (z.reg.fC ) res |= 0x01 
 
	return res 
}


function setAF(z,val)
{
z.reg.A = (val >> 8) 
setF(z, val) 
}
function setF(z,val)
{
	z.reg.fS  = (val & 0x80) 
	z.reg.fZ  = (val & 0x40) 
	z.reg.f5  = (val & 0x20) 
	z.reg.fH  = (val & 0x10) 
	z.reg.f3  = (val & 0x08) 
	z.reg.fPV = (val & 0x04) 
	z.reg.fN  = (val & 0x02) 
	z.reg.fC  = (val & 0x01) 
}
function setPC(z,val)
{
	z.reg.PC =  val 
}




function GetState(z)
{
	return {
	'PC' : z.reg.PC,
	'cycles' : z.cycles,

	'AF' : getAF(z),
	'BC' : z.reg.BC,
	'DE' : z.reg.DE,
	'HL' : z.reg.HL,
	'AFp': z.reg.AFp,
	'BCp': z.reg.BCp,
	'DEp': z.reg.DEp,
	'HLp': z.reg.HLp,
	'IX' : z.reg.IX,
	'IY' : z.reg.IY,
	'SP' : z.reg.SP,
	'I' : z.reg.I,
	'IFF1' : z.reg.IFF1,
	'IFF2' : z.reg.IFF2,
	'IM' : z.reg.IM,
	'R' : z.reg.R,
	'IRQ' : z.beam_IRQ,
	'IRQon' : z.beam_IRQ_enabled,
	'frame' : z.frame_cnt,
	'port236' : z.port236output
	//'mem' : z.sys.mem
	};
}

function SetState(z, state) {
	if ('PC' in state)	z.reg.PC = state['PC'];
	if ('SP' in state)	z.reg.SP = state['SP'];
	if ('AF' in state)	setAF(z, state['AF']);
	if ('BC' in state)	z.reg.BC = state['BC'];
	if ('DE' in state)	z.reg.DE = state['DE'];
	if ('HL' in state)	z.reg.HL = state['HL'];
	if ('AF_' in state)	z.reg.AFp = state['AF_'];
	if ('BC_' in state)	z.reg.BCp = state['BC_'];
	if ('DE_' in state)	z.reg.DEp = state['DE_'];
	if ('HL_' in state)	z.reg.HLp = state['HL_'];
	if ('IX' in state)	z.reg.IX = state['IX'];
	if ('IY' in state)	z.reg.IY = state['IY'];
	if ('I' in state)	z.reg.I = state['I'];
	if ('IFF1' in state)	z.reg.IFF1 = state['IFF1'];
	if ('IFF2' in state)	z.reg.IFF2 = state['IFF2'];
	if ('R' in state)	z.reg.R = state['R'];
	if ('cycles' in state)	z.cycles = state['cycles'];
	if ('IM' in state)	z.reg.IM = state['IM'];
	if ('IRQ' in state)	z.beam_IRQ = state['IRQ'];
	if ('IRQon' in state)	z.beam_IRQ_enabled = state['IRQon'];
	if ('frame' in state)	z.frame_cnt = state['frame'];
	if ('port236' in state)	z.port236output = state['port236'];
	//if ('mem' in state)	z.sys.mem = state['mem'].slice(0);
}









/**
 * @constructor
 */
function regz80()
{
    this.A = 0;
    this.fS = 0;
    this.fZ = 0;
    this.f5 = 0;
    this.fH = 0;
    this.f3 = 0;
    this.fPV = 0;
    this.fN = 0;
    this.fC = 0;
    this.BC = 0
    this.DE = 0
    this.HL = 0
    this.IX = 0
    this.IY = 0
    this.SP = 0
    this.PC = 0
    this.AFp = 0;
    this.BCp = 0
    this.DEp = 0
    this.HLp = 0
    this.I = 0
    this.R = 0
    this.IM = 0
    this.IFF1 = 0
    this.IFF2 = 0
    this.tmp = 0;
    this.IQ = 0;
}
/**
 * @constructor
 */
function z80cons( mem = [] )
{
    this.reg = new regz80()
    this.cycles = 0
    this.mem = mem;
    this.port236output = 0
    this.beam_IRQ = 0
    this.beam_IRQ_enabled = 0
    this.frame_cnt = 0
}



function resetz80(z)
{
	z.reg.PC =  0 
	z.cycles = 0 
  
	setAF(z, 0 )
	z.reg.BC =  0 
	z.reg.DE =  0 
	z.reg.HL =  0 
	z.reg.AFp =  0 
	z.reg.BCp =  0 
	z.reg.DEp =  0 
	z.reg.HLp =  0 
	z.reg.IX =  0 
	z.reg.IY =  0 
	z.reg.SP =  0 
	z.reg.I = 0 
	z.reg.IFF1 = 0 
	z.reg.IFF2 = 0 
	z.reg.IM = 0 
	z.reg.R = 0 
	z.beam_IRQ = 0 
	z.beam_IRQ_enabled = 0 
	z.frame_cnt = 0 
	z.port236output = 0 
}




function initEmulator() {

	//keyinit();

	build_ptable();

	build_all();
}


function LoadRom(z) {
  log9('rom ...');
  let f = Droid.CreateFile('app',trs80RomFile,'r');
  let l = f.getLength();
  //log(l);
  let rom64 = f.read(l);
  //log(rom64.length);
  let rom2 = atob(rom64);
  //log(rom2[0]);
  for (i = 0; i < rom2.length; i++) {
		  z.mem[i] = rom2[i].charCodeAt(0);
	 }
	 // was 0xe7;
	 for (; i < 14336; i++) {
		  z.mem[i] = trs80PostRomByte;
	 }
}

function createEmulator()
{
	var _z80 = new z80cons()

	var i
	for (i = 0; i < 65536; i++)
	{
		_z80.mem[i] = 0x76;
	}
	for (i = 0; i < 2048; i++)
	{
		_z80.mem[0x3800 + i] = 0;
	}
	for (i = 0; i < 256; i++)
	{
		_z80.mem[0x3700 + i] = 0;
	}
	LoadRom(_z80);

	resetz80(_z80);

	_z80.z80timer = 1;
	_z80.__frameDraw = (function(z) { var lz = z; return function() { frameDraw(lz); } })(_z80);
	_z80.__debugFrame = (function(z) { var lz = z; return function() { debugFrame(lz); } })(_z80);

	keysetup(_z80);

	_z80.PerfDraw = PerfDraw_Empty;
	_z80.TRS80Draw = TRS80Draw_Empty;

	_z80.doRender = 1;
	_z80.doEmu = 1;
	_z80.gOffset = 0;

	_z80.runButton = { 'value': 'Run'};

	_z80.breakpoints = {};
	_z80.debugevent = {
		'show' : function() { },
		'running' : function() { },
		'rundebug' : function() { },
		'stopped' : function() { }
	} ;

	// color = rgb for foreground, light foreground, background, light background
	_z80._color = [
		255, 255, 255,
		160, 160, 160,
		  0,   0,   0,
		  0,   0,   0 ];
	_z80._invert = 0;	// indicates fg/bg are swapped.

	return _z80;
}












var ptable;



// Support routines for refz80.js and trs80.html

<!-- Library code -->

// (signed char) replacement
function signed_char(x)
{
	x &= 0xff;
	if (x >= 128) x -= 256;
	return x;
}
function signed_int(x)
{
	return x & 0xff;
}

function cy(z,N)
{
	z.cycles -= N;
}





<!-- Constructors -->

function build_ptable()
{
	// Table for parity flag lookup.
	var i, cnt;
	ptable = [];
	for (i = 0; i < 256; i++) {
	    cnt = 
		!!(i & 0x80) + 
		!!(i & 0x40) + 
		!!(i & 0x20) + 
		!!(i & 0x10) + 
		!!(i & 0x08) + 
		!!(i & 0x04) + 
		!!(i & 0x02) + 
		!!(i & 0x01) ;
	    ptable[i] = !(cnt & 1) 
	}
}

<!-- I/O support -->

function TRS80PortIn(z, port)
{
  // bjs


	// XXX - only reports status of video IRQ, not others.
	if (port == 0xe0)
		return (z.beam_IRQ ? ~4 : 0xff) & 255;

	// XXX - big hack -- port 255 gives most of 236
	if (port == 0xff)
		return (z.port236output & ~3) & 255;

	if (port == 0xec)
		z.beam_IRQ = 0;

	if (port == 0xf8)
		return 0x30;	// printer is ready!

  return z.sys.inp( port );
	return 255;
}

function TRS80PortOut(z, port, data)
{
  // bjs
  //
  //
	if (port == 236) {
		z.port236output = data;
	}

	if (port == 0xe0) {
		z.beam_IRQ_enabled = data & 4;
	}

  z.sys.out( port, data );
}




function zin(z,port,accV,doflags)
{
    accV = TRS80PortIn(z, port) 
    if (doflags) { 
	assign_s(z, accV & 0x80) 
	assign_z(z, !(accV)) 
	assign_h(z, 0) 
	assign_pv(z, parity(accV)) 
	assign_n(z, 0) 
    } 
    return accV 
}





function assign_3(z,val)
{
z.reg.f3 = val 
}
function assign_5(z,val)
{
z.reg.f5 = val 
}
function assign_c(z,val)
{
z.reg.fC = val 
}
function assign_h(z,val)
{
z.reg.fH = val 
}
function assign_n(z,val)
{
z.reg.fN = val 
}
function assign_pv(z,val)
{
z.reg.fPV = val 
}
function assign_s(z,val)
{
z.reg.fS = val 
}
function assign_z(z,val)
{
z.reg.fZ = val 
}




function genirq(z,vec)
{
	 
	push( z, z.reg.PC ) 
	z.reg.PC =  vec 
}







function rs_flags(z,val)
{
    assign_z(z, !(val)) 
    assign_s(z, val & 0x80) 
    assign_h(z, 0) 
    assign_pv(z, parity(val)) 
    assign_n(z, 0) 
	assign_5(z, val & 0x20) 
	assign_3(z, val & 0x08) 
}








function ex_memsp(z,rV)
{
	var temp;

	 
    temp = rV 
    rV = load16(z, z.reg.SP) 
    store16(z, z.reg.SP, temp) 
    return rV 
}
//
//
// Memory hooks
//
//
function fetch_n( z ) {
  try {
	  return z.sys.rd( z.reg.PC++ );
  } catch( e ) {
    console.log( z.reg.PC );
  }
  //return z.mem[z.reg.PC++] 
}

function fetch_nn( z ) {
  let lw = z.sys.rd( z.reg.PC++ );
  return ( z.sys.rd( z.reg.PC++ ) << 8 ) | lw;
  //return ( z.mem[z.reg.PC++] << 8 ) | lw; 
}

function fetch_opcode( z ) {
	z.reg.R = ( z.reg.R + 1 ) & 0x7f;
  let opcode = z.sys.rd( z.reg.PC++ );
  //let opcode = z.mem[z.reg.PC++] 
  z.reg.PC &= 0xffff; // added by bjs
  return opcode;
}

function load16( z, addr ) {
  //let lw = z.mem[ addr++ ];
  let lw = z.sys.rd( addr++ );
  return ( z.sys.rd( addr ) << 8 ) | lw;
  //return ( z.mem[mem] << 8 ) | lw ;
}
function load8( z, addr ) {
  return z.sys.rd( addr );
	//return z.mem[mem];
}

function mode_1_IRQ(z)
{
	if (z.reg.IFF1 == 0) 
		return 0 
	 
	 
	push(z, z.reg.PC) 
	z.reg.PC =  0x38 
	z.reg.IFF1 = z.reg.IFF2 = 0 
	cy(z, 11 + 2) 
	return 1 
}


function zout(z,port,val)
{
	TRS80PortOut(z, port, val) 
}
function parity(val)
{
	return ptable[val & 0xff] 
}


function putbyte( z, addr, b ) {
  z.sys.wr( addr, b );
   //z.mem[addr] = val;
  //if (addr >= 12288) z.mem[addr] = val;
   /*
   if ( addr == 0x37ec ) {
     log( '37ec ' + z.reg.PC );
     log( z.reg.AF );
     log( z.reg.BC );
     log( z.reg.DE );
     log( z.reg.HL );
     log( z.mem[1706] );
     log( z.mem[1707] );
     log( z.mem[1708] );
     log( z.mem[1709] );
   }
   */
}

function store16(z,mem,val) {
	putbyte(z, mem, (val & 0xff)) 
	putbyte(z, (mem + 1), ((val >> 8) & 0xff)) 
}
function store8(z,mem,val) {
	putbyte(z, mem, val) 
}


//
// ************************
//



function add(z,accV,val,cry,docarry)
{
	var res;

    res = signed_int(accV) + val + cry 
    assign_s(z, res & 0x80) 
    if (docarry) assign_c(z, res & 0x100) 
    assign_h(z, ((accV & 15) + (val & 15) + cry) & 16) 
    assign_n(z, 0) 
    assign_z(z, !(res & 0xff)) 
    res = signed_char(accV) + signed_char(val) + cry 
    assign_pv(z, res > 127 || res < -128) 
    accV = signed_int(accV) + val + cry 
    return accV & 255 
}
function add16(z,accV,val)
{
	var r;

    assign_n(z, 0) 
    assign_h(z, ((accV & 0xfff) + (val & 0xfff)) & 0x1000) 
    r = ((accV & 0xff) + (val & 0xff)) >> 8 
    assign_c(z, ((accV >> 8) + (val >> 8) + r) & 0x100) 
	accV += val 
    return accV & 65535 
}
function and(z,val)
{
    z.reg.A =z.reg.A & val 
    assign_s(z, z.reg.A & 0x80) 
    assign_z(z, !(z.reg.A)) 
    assign_h(z, 1) 
    assign_pv(z, parity(z.reg.A)) 
    assign_n(z, 0) 
    assign_c(z, 0) 
}

function adc16(z,accV,val)
{
	var res;

	z.reg.tmp = accV & 0xff 
    z.reg.tmp = add(z, z.reg.tmp, val & 0xff, !!(z.reg.fC), 1) 
	res = z.reg.tmp 
	z.reg.tmp = (accV >> 8) & 0xff 
    z.reg.tmp = add(z, z.reg.tmp, (val >> 8) & 0xff, !!(z.reg.fC), 1) 
	res = (z.reg.tmp << 8) | res 
	accV = res 
    assign_z(z, !(accV)) 
    return accV 
}

function bit(z,val,bit)
{
    assign_h(z, 1) 
    assign_n(z, 0) 
    assign_z(z, !(val & (1 << bit))) 
}

function branch( z, cond ) {
	var newpc;
	//newpc = signed_char( z.mem[z.reg.PC++] );
	newpc = signed_char( fetch_n( z ) );
  newpc += z.reg.PC;
  if (cond) {  
    z.reg.PC = newpc;
    return 12;
  } 
	return 7;
}

function call(z,cond)
{
	var newpc;

	newpc = fetch_nn(z) 
    if (cond) { 
	 
	push(z, z.reg.PC) 
	z.reg.PC =  newpc 
	cy(z, 7) 
		 
    } 
}



function cp(z,val)
{
    z.reg.tmp = z.reg.A 
    z.reg.tmp = sub(z, z.reg.tmp, val, 0, 1) 
}
function daa(z)
{
	var res;

	res = z.reg.A 
    if (getF(z) & 2) { 
		if ((res & 15) > 9 || (getF(z) & 16)) 
		    res -= 6 
		if (z.reg.A > 0x99 || !!(z.reg.fC)) 
		    res -= 0x60 
		assign_h(z, (getF(z) & 16) && (z.reg.A & 15) < 6) 
		if (z.reg.A > 0x99) 
		    assign_c(z, 1) 
		z.reg.A = (res & 255) 
    } 
    else { 
		if ((res & 15) > 9 || (getF(z) & 16)) 
		    res += 6 
		if (res > 0x9f || !!(z.reg.fC)) 
		    res += 0x60 
		if (res > 255) 
		    assign_c(z, 1) 
		assign_h(z, (z.reg.A & 15) > 9) 
		z.reg.A = (res & 255) 
    } 
    assign_s(z, z.reg.A & 0x80) 
    assign_z(z, !(z.reg.A)) 
    assign_pv(z, parity(z.reg.A)) 
	assign_5(z, z.reg.A & 0x20) 
	assign_3(z, z.reg.A & 0x08) 
}
function dec_b(z)
{
	qq =  ((z.reg.BC >> 8) - 1) & 255 ; z.reg.BC = (z.reg.BC &   0xff) | (qq << 8)
}
function dec_bc(z)
{
z.reg.BC = (z.reg.BC - 1) & 0xffff 
}
function dec_de(z)
{
z.reg.DE = (z.reg.DE - 1) & 0xffff 
}
function dec_hl(z)
{
z.reg.HL = (z.reg.HL - 1) & 0xffff 
}
function dec_sp(z)
{
z.reg.SP = (z.reg.SP - 1) & 0xffff 
}
function dec_xy(z)
{
z.reg.IQ = (z.reg.IQ - 1) & 0xffff 
}
function decp(z,accV)
{
	accV = sub(z, accV, 1, 0, 0) 
    return accV 
}





function inc_bc(z)
{
z.reg.BC = (z.reg.BC + 1) & 0xffff 
}
function inc_de(z)
{
z.reg.DE = (z.reg.DE + 1) & 0xffff 
}
function inc_hl(z)
{
z.reg.HL = (z.reg.HL + 1) & 0xffff 
}
function inc_sp(z)
{
z.reg.SP = (z.reg.SP + 1) & 0xffff 
}
function inc_xy(z)
{
z.reg.IQ = (z.reg.IQ + 1) & 0xffff 
}
function incp(z,accV)
{
	accV = add(z, accV, 1, 0, 0) 
    return accV 
}

function ixy( z ) {
	//return signed_char( z.mem[z.reg.PC++] ) + z.reg.IQ;
	return signed_char( fetch_n( z ) ) + z.reg.IQ;
}

function jump(z,cond)
{
	var newpc;

	newpc = fetch_nn(z) 
    if (cond) {  
 z.reg.PC =  newpc 
 } 
}



function or(z,val)
{
    z.reg.A =z.reg.A | val 
    assign_s(z, z.reg.A & 0x80) 
    assign_z(z, !(z.reg.A)) 
    assign_h(z, 0) 
    assign_pv(z, parity(z.reg.A)) 
    assign_n(z, 0) 
    assign_c(z, 0) 
}

function pop( z, valV ) {
	let popval = 0;
  //popval = z.mem[ z.reg.SP ];
  popval = load8( z, z.reg.SP );
  inc_sp( z );
  //popval |= ( ( z.mem[z.reg.SP] & 0xff ) << 8 );
  popval |= ( ( load8( z, z.reg.SP ) & 0xff ) << 8 );
	valV = popval;
  inc_sp(z);
  return valV;
}

function push(z,val)
{
	 
    dec_sp(z) 
	 
    putbyte(z, z.reg.SP, ((val >> 8) & 255)) 
    dec_sp(z) 
	 
    putbyte(z, z.reg.SP, (val & 255)) 
}

function res(z,valV,bit)
{
    valV &= ~(1 << bit) 
    return valV 
}


function rl(z,accV)
{
	var prevc;

	prevc = !!(z.reg.fC) 
    assign_c(z, accV & 0x80) 
    accV <<= 1 
	accV &= 255 
    accV |= prevc 
    rs_flags(z, accV) 
    return accV 
}
function rla(z)
{
	var prevc;

	prevc = !!(z.reg.fC) 
    assign_h(z, 0) 
    assign_n(z, 0) 
    assign_c(z, z.reg.A & 0x80) 
    z.reg.A =z.reg.A << 1 
	z.reg.A =z.reg.A & 255 
    z.reg.A =z.reg.A | prevc 
}
function rlc(z,accV)
{
    assign_c(z, accV & 0x80) 
    accV <<= 1 
	accV &= 255 
    accV |= !!(z.reg.fC) 
    rs_flags(z, accV) 
    return accV 
}
function rlca(z)
{
    assign_h(z, 0) 
    assign_n(z, 0) 
    assign_c(z, z.reg.A & 0x80) 
    z.reg.A =z.reg.A << 1 
	z.reg.A =z.reg.A & 255 
    z.reg.A =z.reg.A | !!(z.reg.fC) 
}
function rr(z,accV)
{
	var prevc;

	prevc = !!(z.reg.fC) 
    assign_c(z, accV & 1) 
    accV = (accV >> 1) & 0x7f 
    accV |= prevc << 7 
    rs_flags(z, accV) 
    return accV 
}
function rra(z)
{
	var prevc;

	prevc = !!(z.reg.fC) 
    assign_h(z, 0) 
    assign_n(z, 0) 
    assign_c(z, z.reg.A & 1) 
    z.reg.A = (z.reg.A >> 1) & 0x7f 
    z.reg.A =z.reg.A | prevc << 7 
}


function rrc(z,accV)
{
    assign_c(z, accV & 1) 
     
      
      
    accV = (accV >> 1) & 0x7f 
    accV |= !!(z.reg.fC) << 7 
    rs_flags(z, accV) 
    return accV 
}
function rrca(z)
{
    assign_h(z, 0) 
    assign_n(z, 0) 
    assign_c(z, z.reg.A & 1) 
    z.reg.A = (z.reg.A >> 1) & 0x7f 
    z.reg.A =z.reg.A | !!(z.reg.fC) << 7 
}


function sbc16(z,accV,val)
{
	var res;

	z.reg.tmp = accV & 0xff 
    z.reg.tmp = sub(z, z.reg.tmp, val & 0xff, !!(z.reg.fC), 1) 
	res = z.reg.tmp 
	z.reg.tmp = (accV >> 8) & 0xff 
    z.reg.tmp = sub(z, z.reg.tmp, (val >> 8) & 0xff, !!(z.reg.fC), 1) 
	res = (z.reg.tmp << 8) | res 
	accV = res 
    assign_z(z, !(accV)) 
    return accV 
}
function set(z,valV,bit)
{
    valV |= 1 << bit 
    return valV 
}


function sl1(z,accV)
{
    assign_c(z, accV & 0x80) 
    accV <<= 1 
	accV &= 255 
	accV |= 1 
    rs_flags(z, accV) 
    return accV 
}
function sla(z,accV)
{
    assign_c(z, accV & 0x80) 
    accV <<= 1 
	accV &= 255 
    rs_flags(z, accV) 
    return accV 
}


function sra(z,accV)
{
    assign_c(z, accV & 1) 
     
    accV = (accV >> 1) & 0x7f 
    accV |= (accV << 1) & 0x80 
    rs_flags(z, accV) 
    return accV 
}
function srl(z,accV)
{
    assign_c(z, accV & 1) 
    accV = (accV >> 1) & 0x7f 
    rs_flags(z, accV) 
    return accV 
}

function sub(z,accV,val,cry,docarry)
{
	var res;

    res = signed_int(accV) - val - cry 
    assign_s(z, res & 0x80) 
    if (docarry) assign_c(z, res & 0x100) 
    assign_h(z, ((accV & 15) - (val & 15) - cry) & 16) 
    assign_n(z, 1) 
    assign_z(z, !(res & 0xff)) 
    res = signed_char(accV) - signed_char(val) - cry 
    assign_pv(z, res > 127 || res < -128) 
    accV = signed_int(accV) - val - cry 
    return accV & 255 
}

function xor(z,val)
{
    z.reg.A =z.reg.A ^ val 
    assign_s(z, z.reg.A & 0x80) 
    assign_z(z, !(z.reg.A)) 
    assign_h(z, 0) 
    assign_pv(z, parity(z.reg.A)) 
    assign_n(z, 0) 
    assign_c(z, 0) 
}













//
// ********** op functions
//



function op_00(z)
{
     cy(z, 4) 
   
}
function op_01(z)
{
     cy(z, 10) 
 z.reg.BC =  fetch_nn(z) 
  
}
function op_02(z)
{
     cy(z, 7) 
  store8(z, z.reg.BC, z.reg.A) 
  
}
function op_03(z)
{
     cy(z, 6) 
  inc_bc(z) 
  
}
function op_04(z)
{
     cy(z, 4) 
  qq =  incp(z, (z.reg.BC >> 8)) ; z.reg.BC = (z.reg.BC &   0xff) | (qq << 8)
  
}
function op_05(z)
{
     cy(z, 4) 
  qq =  decp(z, (z.reg.BC >> 8)) ; z.reg.BC = (z.reg.BC &   0xff) | (qq << 8)
  
}
function op_06(z)
{
     cy(z, 7) 
  qq =  fetch_n(z) ; z.reg.BC = (z.reg.BC &   0xff) | (qq << 8)
  
}
function op_07(z)
{
     cy(z, 4) 
  rlca(z) 
  
}
function op_08(z)
{
     cy(z, 4) 
  extmp = getAF(z); setAF(z, z.reg.AFp); z.reg.AFp =  extmp 
  
}
function op_09(z)
{
     cy(z, 11) 
 z.reg.HL =  add16(z, z.reg.HL, z.reg.BC) 
  
}
function op_0a(z)
{
     cy(z, 7) 
  z.reg.A = load8(z, z.reg.BC) 
  
}
function op_0b(z)
{
     cy(z, 6) 
  dec_bc(z) 
  
}
function op_0c(z)
{
     cy(z, 4) 
  qq =  incp(z, (z.reg.BC & 0xff)) ; z.reg.BC = (z.reg.BC & 0xff00) | qq
  
}
function op_0d(z)
{
     cy(z, 4) 
  qq =  decp(z, (z.reg.BC & 0xff)) ; z.reg.BC = (z.reg.BC & 0xff00) | qq
  
}
function op_0e(z)
{
     cy(z, 7) 
  qq =  fetch_n(z) ; z.reg.BC = (z.reg.BC & 0xff00) | qq
  
}
function op_0f(z)
{
     cy(z, 4) 
  rrca(z) 
  
}
function op_10(z)
{
     dec_b(z) 
 cy(z,  branch(z, !!((z.reg.BC >> 8))) + 1) 
  
}
function op_11(z)
{
     cy(z, 10) 
 z.reg.DE =  fetch_nn(z) 
  
}
function op_12(z)
{
     cy(z, 7) 
  store8(z, z.reg.DE, z.reg.A) 
  
}
function op_13(z)
{
     cy(z, 6) 
  inc_de(z) 
  
}
function op_14(z)
{
     cy(z, 4) 
  qq =  incp(z, (z.reg.DE >> 8)) ; z.reg.DE = (z.reg.DE &   0xff) | (qq << 8)
  
}
function op_15(z)
{
     cy(z, 4) 
  qq =  decp(z, (z.reg.DE >> 8)) ; z.reg.DE = (z.reg.DE &   0xff) | (qq << 8)
  
}
function op_16(z)
{
     cy(z, 7) 
  qq =  fetch_n(z) ; z.reg.DE = (z.reg.DE &   0xff) | (qq << 8)
  
}
function op_17(z)
{
     cy(z, 4) 
  rla(z) 
  
}
function op_18(z)
{
     cy(z, 	branch(z, 1) ) 
  
}
function op_19(z)
{
     cy(z, 11) 
 z.reg.HL =  add16(z, z.reg.HL, z.reg.DE) 
  
}
function op_1a(z)
{
     cy(z, 7) 
  z.reg.A = load8(z, z.reg.DE) 
  
}
function op_1b(z)
{
     cy(z, 6) 
  dec_de(z) 
  
}
function op_1c(z)
{
     cy(z, 4) 
  qq =  incp(z, (z.reg.DE & 0xff)) ; z.reg.DE = (z.reg.DE & 0xff00) | qq
  
}
function op_1d(z)
{
     cy(z, 4) 
  qq =  decp(z, (z.reg.DE & 0xff)) ; z.reg.DE = (z.reg.DE & 0xff00) | qq
  
}
function op_1e(z)
{
     cy(z, 7) 
  qq =  fetch_n(z) ; z.reg.DE = (z.reg.DE & 0xff00) | qq
  
}
function op_1f(z)
{
     cy(z, 4) 
  rra(z) 
  
}
function op_20(z)
{
     cy(z,  branch(z, !(z.reg.fZ)) ) 
  
}
function op_21(z)
{
     cy(z, 10) 
 z.reg.HL =  fetch_nn(z) 
  
}
function op_22(z)
{
     cy(z, 16) 
 store16(z, fetch_nn(z), z.reg.HL) 
  
}
function op_23(z)
{
     cy(z, 6) 
  inc_hl(z) 
  
}
function op_24(z)
{
     cy(z, 4) 
  qq =  incp(z, (z.reg.HL >> 8)) ; z.reg.HL = (z.reg.HL &   0xff) | (qq << 8)
  
}
function op_25(z)
{
     cy(z, 4) 
  qq =  decp(z, (z.reg.HL >> 8)) ; z.reg.HL = (z.reg.HL &   0xff) | (qq << 8)
  
}
function op_26(z)
{
     cy(z, 7) 
  qq =  fetch_n(z) ; z.reg.HL = (z.reg.HL &   0xff) | (qq << 8)
  
}
function op_27(z)
{
     cy(z, 4) 
  daa(z) 
  
}
function op_28(z)
{
     cy(z,  branch(z, z.reg.fZ) ) 
  
}
function op_29(z)
{
     cy(z, 11) 
 z.reg.HL =  add16(z, z.reg.HL, z.reg.HL) 
  
}
function op_2a(z)
{
     cy(z, 16) 
 z.reg.HL =  load16(z, fetch_nn(z)) 
  
}
function op_2b(z)
{
     cy(z, 6) 
  dec_hl(z) 
  
}
function op_2c(z)
{
     cy(z, 4) 
  qq =  incp(z, (z.reg.HL & 0xff)) ; z.reg.HL = (z.reg.HL & 0xff00) | qq
  
}
function op_2d(z)
{
     cy(z, 4) 
  qq =  decp(z, (z.reg.HL & 0xff)) ; z.reg.HL = (z.reg.HL & 0xff00) | qq
  
}
function op_2e(z)
{
     cy(z, 7) 
  qq =  fetch_n(z) ; z.reg.HL = (z.reg.HL & 0xff00) | qq
  
}
function op_2f(z)
{
     cy(z, 4) 
  z.reg.A = (~z.reg.A) & 255 
 assign_h(z, 1) 
 assign_n(z, 1) 
  
}
function op_30(z)
{
     cy(z,  branch(z, !(z.reg.fC)) ) 
  
}
function op_31(z)
{
     cy(z, 10) 
 z.reg.SP =  fetch_nn(z) 
  
}
function op_32(z)
{
     cy(z, 13) 
 store8(z, fetch_nn(z), z.reg.A) 
  
}
function op_33(z)
{
     cy(z, 6) 
  inc_sp(z) 
  
}
function op_34(z)
{
     cy(z, 11) 
 z.reg.tmp = load8(z, z.reg.HL) 
 z.reg.tmp = incp(z, z.reg.tmp) 
  
 store8(z, z.reg.HL, z.reg.tmp) 
  
}
function op_35(z)
{
     cy(z, 11) 
 z.reg.tmp = load8(z, z.reg.HL) 
 z.reg.tmp = decp(z, z.reg.tmp) 
  
 store8(z, z.reg.HL, z.reg.tmp) 
  
}
function op_36(z)
{
     cy(z, 10) 
 store8(z, z.reg.HL, fetch_n(z)) 
  
}
function op_37(z)
{
     cy(z, 4) 
  assign_c(z, 1) 
 assign_h(z, 0) 
 assign_n(z, 0) 
  
}
function op_38(z)
{
     cy(z,  branch(z, z.reg.fC) ) 
  
}
function op_39(z)
{
     cy(z, 11) 
 z.reg.HL =  add16(z, z.reg.HL, z.reg.SP) 
  
}
function op_3a(z)
{
     cy(z, 13) 
 z.reg.A = load8(z, fetch_nn(z)) 
  
}
function op_3b(z)
{
     cy(z, 6) 
  dec_sp(z) 
  
}
function op_3c(z)
{
     cy(z, 4) 
  z.reg.A = incp(z, z.reg.A) 
  
}
function op_3d(z)
{
     cy(z, 4) 
  z.reg.A = decp(z, z.reg.A) 
  
}
function op_3e(z)
{
     cy(z, 7) 
  z.reg.A = fetch_n(z) 
  
}
function op_3f(z)
{
     cy(z, 4) 
  assign_h(z, !!(z.reg.fC)) 
 assign_c(z, !(!!(z.reg.fC))) 
 assign_n(z, 0) 
  
}
function op_40(z)
{
     cy(z, 4) 
   
}
function op_41(z)
{
     cy(z, 4) 
  qq =  (z.reg.BC & 0xff) ; z.reg.BC = (z.reg.BC &   0xff) | (qq << 8)
  
}
function op_42(z)
{
     cy(z, 4) 
  qq =  (z.reg.DE >> 8) ; z.reg.BC = (z.reg.BC &   0xff) | (qq << 8)
  
}
function op_43(z)
{
     cy(z, 4) 
  qq =  (z.reg.DE & 0xff) ; z.reg.BC = (z.reg.BC &   0xff) | (qq << 8)
  
}
function op_44(z)
{
     cy(z, 4) 
  qq =  (z.reg.HL >> 8) ; z.reg.BC = (z.reg.BC &   0xff) | (qq << 8)
  
}
function op_45(z)
{
     cy(z, 4) 
  qq =  (z.reg.HL & 0xff) ; z.reg.BC = (z.reg.BC &   0xff) | (qq << 8)
  
}
function op_46(z)
{
     cy(z, 7) 
  qq =  load8(z, z.reg.HL) ; z.reg.BC = (z.reg.BC &   0xff) | (qq << 8)
  
}
function op_47(z)
{
     cy(z, 4) 
  qq =  z.reg.A ; z.reg.BC = (z.reg.BC &   0xff) | (qq << 8)
  
}
function op_48(z)
{
     cy(z, 4) 
  qq =  (z.reg.BC >> 8) ; z.reg.BC = (z.reg.BC & 0xff00) | qq
  
}
function op_49(z)
{
     cy(z, 4) 
   
}
function op_4a(z)
{
     cy(z, 4) 
  qq =  (z.reg.DE >> 8) ; z.reg.BC = (z.reg.BC & 0xff00) | qq
  
}
function op_4b(z)
{
     cy(z, 4) 
  qq =  (z.reg.DE & 0xff) ; z.reg.BC = (z.reg.BC & 0xff00) | qq
  
}
function op_4c(z)
{
     cy(z, 4) 
  qq =  (z.reg.HL >> 8) ; z.reg.BC = (z.reg.BC & 0xff00) | qq
  
}
function op_4d(z)
{
     cy(z, 4) 
  qq =  (z.reg.HL & 0xff) ; z.reg.BC = (z.reg.BC & 0xff00) | qq
  
}
function op_4e(z)
{
     cy(z, 7) 
  qq =  load8(z, z.reg.HL) ; z.reg.BC = (z.reg.BC & 0xff00) | qq
  
}
function op_4f(z)
{
     cy(z, 4) 
  qq =  z.reg.A ; z.reg.BC = (z.reg.BC & 0xff00) | qq
  
}
function op_50(z)
{
     cy(z, 4) 
  qq =  (z.reg.BC >> 8) ; z.reg.DE = (z.reg.DE &   0xff) | (qq << 8)
  
}
function op_51(z)
{
     cy(z, 4) 
  qq =  (z.reg.BC & 0xff) ; z.reg.DE = (z.reg.DE &   0xff) | (qq << 8)
  
}
function op_52(z)
{
     cy(z, 4) 
   
}
function op_53(z)
{
     cy(z, 4) 
  qq =  (z.reg.DE & 0xff) ; z.reg.DE = (z.reg.DE &   0xff) | (qq << 8)
  
}
function op_54(z)
{
     cy(z, 4) 
  qq =  (z.reg.HL >> 8) ; z.reg.DE = (z.reg.DE &   0xff) | (qq << 8)
  
}
function op_55(z)
{
     cy(z, 4) 
  qq =  (z.reg.HL & 0xff) ; z.reg.DE = (z.reg.DE &   0xff) | (qq << 8)
  
}
function op_56(z)
{
     cy(z, 7) 
  qq =  load8(z, z.reg.HL) ; z.reg.DE = (z.reg.DE &   0xff) | (qq << 8)
  
}
function op_57(z)
{
     cy(z, 4) 
  qq =  z.reg.A ; z.reg.DE = (z.reg.DE &   0xff) | (qq << 8)
  
}
function op_58(z)
{
     cy(z, 4) 
  qq =  (z.reg.BC >> 8) ; z.reg.DE = (z.reg.DE & 0xff00) | qq
  
}
function op_59(z)
{
     cy(z, 4) 
  qq =  (z.reg.BC & 0xff) ; z.reg.DE = (z.reg.DE & 0xff00) | qq
  
}
function op_5a(z)
{
     cy(z, 4) 
  qq =  (z.reg.DE >> 8) ; z.reg.DE = (z.reg.DE & 0xff00) | qq
  
}
function op_5b(z)
{
     cy(z, 4) 
   
}
function op_5c(z)
{
     cy(z, 4) 
  qq =  (z.reg.HL >> 8) ; z.reg.DE = (z.reg.DE & 0xff00) | qq
  
}
function op_5d(z)
{
     cy(z, 4) 
  qq =  (z.reg.HL & 0xff) ; z.reg.DE = (z.reg.DE & 0xff00) | qq
  
}
function op_5e(z)
{
     cy(z, 7) 
  qq =  load8(z, z.reg.HL) ; z.reg.DE = (z.reg.DE & 0xff00) | qq
  
}
function op_5f(z)
{
     cy(z, 4) 
  qq =  z.reg.A ; z.reg.DE = (z.reg.DE & 0xff00) | qq
  
}
function op_60(z)
{
     cy(z, 4) 
  qq =  (z.reg.BC >> 8) ; z.reg.HL = (z.reg.HL &   0xff) | (qq << 8)
  
}
function op_61(z)
{
     cy(z, 4) 
  qq =  (z.reg.BC & 0xff) ; z.reg.HL = (z.reg.HL &   0xff) | (qq << 8)
  
}
function op_62(z)
{
     cy(z, 4) 
  qq =  (z.reg.DE >> 8) ; z.reg.HL = (z.reg.HL &   0xff) | (qq << 8)
  
}
function op_63(z)
{
     cy(z, 4) 
  qq =  (z.reg.DE & 0xff) ; z.reg.HL = (z.reg.HL &   0xff) | (qq << 8)
  
}
function op_64(z)
{
     cy(z, 4) 
   
}
function op_65(z)
{
     cy(z, 4) 
  qq =  (z.reg.HL & 0xff) ; z.reg.HL = (z.reg.HL &   0xff) | (qq << 8)
  
}
function op_66(z)
{
     cy(z, 7) 
  qq =  load8(z, z.reg.HL) ; z.reg.HL = (z.reg.HL &   0xff) | (qq << 8)
  
}
function op_67(z)
{
     cy(z, 4) 
  qq =  z.reg.A ; z.reg.HL = (z.reg.HL &   0xff) | (qq << 8)
  
}
function op_68(z)
{
     cy(z, 4) 
  qq =  (z.reg.BC >> 8) ; z.reg.HL = (z.reg.HL & 0xff00) | qq
  
}
function op_69(z)
{
     cy(z, 4) 
  qq =  (z.reg.BC & 0xff) ; z.reg.HL = (z.reg.HL & 0xff00) | qq
  
}
function op_6a(z)
{
     cy(z, 4) 
  qq =  (z.reg.DE >> 8) ; z.reg.HL = (z.reg.HL & 0xff00) | qq
  
}
function op_6b(z)
{
     cy(z, 4) 
  qq =  (z.reg.DE & 0xff) ; z.reg.HL = (z.reg.HL & 0xff00) | qq
  
}
function op_6c(z)
{
     cy(z, 4) 
  qq =  (z.reg.HL >> 8) ; z.reg.HL = (z.reg.HL & 0xff00) | qq
  
}
function op_6d(z)
{
     cy(z, 4) 
   
}
function op_6e(z)
{
     cy(z, 7) 
  qq =  load8(z, z.reg.HL) ; z.reg.HL = (z.reg.HL & 0xff00) | qq
  
}
function op_6f(z)
{
     cy(z, 4) 
  qq =  z.reg.A ; z.reg.HL = (z.reg.HL & 0xff00) | qq
  
}
function op_70(z)
{
     cy(z, 7) 
  store8(z, z.reg.HL, (z.reg.BC >> 8)) 
  
}
function op_71(z)
{
     cy(z, 7) 
  store8(z, z.reg.HL, (z.reg.BC & 0xff)) 
  
}
function op_72(z)
{
     cy(z, 7) 
  store8(z, z.reg.HL, (z.reg.DE >> 8)) 
  
}
function op_73(z)
{
     cy(z, 7) 
  store8(z, z.reg.HL, (z.reg.DE & 0xff)) 
  
}
function op_74(z)
{
     cy(z, 7) 
  store8(z, z.reg.HL, (z.reg.HL >> 8)) 
  
}
function op_75(z)
{
     cy(z, 7) 
  store8(z, z.reg.HL, (z.reg.HL & 0xff)) 
  
}
function op_76(z)
{
     cy(z, 4) 
  z.reg.PC-- 
  
}
function op_77(z)
{
     cy(z, 7) 
  store8(z, z.reg.HL, z.reg.A) 
  
}
function op_78(z)
{
     cy(z, 4) 
  z.reg.A = (z.reg.BC >> 8) 
  
}
function op_79(z)
{
     cy(z, 4) 
  z.reg.A = (z.reg.BC & 0xff) 
  
}
function op_7a(z)
{
     cy(z, 4) 
  z.reg.A = (z.reg.DE >> 8) 
  
}
function op_7b(z)
{
     cy(z, 4) 
  z.reg.A = (z.reg.DE & 0xff) 
  
}
function op_7c(z)
{
     cy(z, 4) 
  z.reg.A = (z.reg.HL >> 8) 
  
}
function op_7d(z)
{
     cy(z, 4) 
  z.reg.A = (z.reg.HL & 0xff) 
  
}
function op_7e(z)
{
     cy(z, 7) 
  z.reg.A = load8(z, z.reg.HL) 
  
}
function op_7f(z)
{
     cy(z, 4) 
   
}
function op_80(z)
{
     cy(z, 4) 
  z.reg.A = add(z, z.reg.A, (z.reg.BC >> 8), 0, 1) 
  
}
function op_81(z)
{
     cy(z, 4) 
  z.reg.A = add(z, z.reg.A, (z.reg.BC & 0xff), 0, 1) 
  
}
function op_82(z)
{
     cy(z, 4) 
  z.reg.A = add(z, z.reg.A, (z.reg.DE >> 8), 0, 1) 
  
}
function op_83(z)
{
     cy(z, 4) 
  z.reg.A = add(z, z.reg.A, (z.reg.DE & 0xff), 0, 1) 
  
}
function op_84(z)
{
     cy(z, 4) 
  z.reg.A = add(z, z.reg.A, (z.reg.HL >> 8), 0, 1) 
  
}
function op_85(z)
{
     cy(z, 4) 
  z.reg.A = add(z, z.reg.A, (z.reg.HL & 0xff), 0, 1) 
  
}
function op_86(z)
{
     cy(z, 7) 
  z.reg.A = add(z, z.reg.A, load8(z, z.reg.HL), 0, 1) 
  
}
function op_87(z)
{
     cy(z, 4) 
  z.reg.A = add(z, z.reg.A, z.reg.A, 0, 1) 
  
}
function op_88(z)
{
     cy(z, 4) 
  z.reg.A = add(z, z.reg.A, (z.reg.BC >> 8), !!(z.reg.fC), 1) 
  
}
function op_89(z)
{
     cy(z, 4) 
  z.reg.A = add(z, z.reg.A, (z.reg.BC & 0xff), !!(z.reg.fC), 1) 
  
}
function op_8a(z)
{
     cy(z, 4) 
  z.reg.A = add(z, z.reg.A, (z.reg.DE >> 8), !!(z.reg.fC), 1) 
  
}
function op_8b(z)
{
     cy(z, 4) 
  z.reg.A = add(z, z.reg.A, (z.reg.DE & 0xff), !!(z.reg.fC), 1) 
  
}
function op_8c(z)
{
     cy(z, 4) 
  z.reg.A = add(z, z.reg.A, (z.reg.HL >> 8), !!(z.reg.fC), 1) 
  
}
function op_8d(z)
{
     cy(z, 4) 
  z.reg.A = add(z, z.reg.A, (z.reg.HL & 0xff), !!(z.reg.fC), 1) 
  
}
function op_8e(z)
{
     cy(z, 7) 
  z.reg.A = add(z, z.reg.A, load8(z, z.reg.HL), !!(z.reg.fC), 1) 
  
}
function op_8f(z)
{
     cy(z, 4) 
  z.reg.A = add(z, z.reg.A, z.reg.A, !!(z.reg.fC), 1) 
  
}
function op_90(z)
{
     cy(z, 4) 
  z.reg.A = sub(z, z.reg.A, (z.reg.BC >> 8), 0, 1) 
  
}
function op_91(z)
{
     cy(z, 4) 
  z.reg.A = sub(z, z.reg.A, (z.reg.BC & 0xff), 0, 1) 
  
}
function op_92(z)
{
     cy(z, 4) 
  z.reg.A = sub(z, z.reg.A, (z.reg.DE >> 8), 0, 1) 
  
}
function op_93(z)
{
     cy(z, 4) 
  z.reg.A = sub(z, z.reg.A, (z.reg.DE & 0xff), 0, 1) 
  
}
function op_94(z)
{
     cy(z, 4) 
  z.reg.A = sub(z, z.reg.A, (z.reg.HL >> 8), 0, 1) 
  
}
function op_95(z)
{
     cy(z, 4) 
  z.reg.A = sub(z, z.reg.A, (z.reg.HL & 0xff), 0, 1) 
  
}
function op_96(z)
{
     cy(z, 7) 
  z.reg.A = sub(z, z.reg.A, load8(z, z.reg.HL), 0, 1) 
  
}
function op_97(z)
{
     cy(z, 4) 
  z.reg.A = sub(z, z.reg.A, z.reg.A, 0, 1) 
  
}
function op_98(z)
{
     cy(z, 4) 
  z.reg.A = sub(z, z.reg.A, (z.reg.BC >> 8), !!(z.reg.fC), 1) 
  
}
function op_99(z)
{
     cy(z, 4) 
  z.reg.A = sub(z, z.reg.A, (z.reg.BC & 0xff), !!(z.reg.fC), 1) 
  
}
function op_9a(z)
{
     cy(z, 4) 
  z.reg.A = sub(z, z.reg.A, (z.reg.DE >> 8), !!(z.reg.fC), 1) 
  
}
function op_9b(z)
{
     cy(z, 4) 
  z.reg.A = sub(z, z.reg.A, (z.reg.DE & 0xff), !!(z.reg.fC), 1) 
  
}
function op_9c(z)
{
     cy(z, 4) 
  z.reg.A = sub(z, z.reg.A, (z.reg.HL >> 8), !!(z.reg.fC), 1) 
  
}
function op_9d(z)
{
     cy(z, 4) 
  z.reg.A = sub(z, z.reg.A, (z.reg.HL & 0xff), !!(z.reg.fC), 1) 
  
}
function op_9e(z)
{
     cy(z, 7) 
  z.reg.A = sub(z, z.reg.A, load8(z, z.reg.HL), !!(z.reg.fC), 1) 
  
}
function op_9f(z)
{
     cy(z, 4) 
  z.reg.A = sub(z, z.reg.A, z.reg.A, !!(z.reg.fC), 1) 
  
}
function op_a0(z)
{
     cy(z, 4) 
  and(z, (z.reg.BC >> 8)) 
  
}
function op_a1(z)
{
     cy(z, 4) 
  and(z, (z.reg.BC & 0xff)) 
  
}
function op_a2(z)
{
     cy(z, 4) 
  and(z, (z.reg.DE >> 8)) 
  
}
function op_a3(z)
{
     cy(z, 4) 
  and(z, (z.reg.DE & 0xff)) 
  
}
function op_a4(z)
{
     cy(z, 4) 
  and(z, (z.reg.HL >> 8)) 
  
}
function op_a5(z)
{
     cy(z, 4) 
  and(z, (z.reg.HL & 0xff)) 
  
}
function op_a6(z)
{
     cy(z, 7) 
  and(z, load8(z, z.reg.HL)) 
  
}
function op_a7(z)
{
     cy(z, 4) 
  and(z, z.reg.A) 
  
}
function op_a8(z)
{
     cy(z, 4) 
  xor(z, (z.reg.BC >> 8)) 
  
}
function op_a9(z)
{
     cy(z, 4) 
  xor(z, (z.reg.BC & 0xff)) 
  
}
function op_aa(z)
{
     cy(z, 4) 
  xor(z, (z.reg.DE >> 8)) 
  
}
function op_ab(z)
{
     cy(z, 4) 
  xor(z, (z.reg.DE & 0xff)) 
  
}
function op_ac(z)
{
     cy(z, 4) 
  xor(z, (z.reg.HL >> 8)) 
  
}
function op_ad(z)
{
     cy(z, 4) 
  xor(z, (z.reg.HL & 0xff)) 
  
}
function op_ae(z)
{
     cy(z, 7) 
  xor(z, load8(z, z.reg.HL)) 
  
}
function op_af(z)
{
     cy(z, 4) 
  xor(z, z.reg.A) 
  
}
function op_b0(z)
{
     cy(z, 4) 
  or(z, (z.reg.BC >> 8)) 
  
}
function op_b1(z)
{
     cy(z, 4) 
  or(z, (z.reg.BC & 0xff)) 
  
}
function op_b2(z)
{
     cy(z, 4) 
  or(z, (z.reg.DE >> 8)) 
  
}
function op_b3(z)
{
     cy(z, 4) 
  or(z, (z.reg.DE & 0xff)) 
  
}
function op_b4(z)
{
     cy(z, 4) 
  or(z, (z.reg.HL >> 8)) 
  
}
function op_b5(z)
{
     cy(z, 4) 
  or(z, (z.reg.HL & 0xff)) 
  
}
function op_b6(z)
{
     cy(z, 7) 
  or(z, load8(z, z.reg.HL)) 
  
}
function op_b7(z)
{
     cy(z, 4) 
  or(z, z.reg.A) 
  
}
function op_b8(z)
{
     cy(z, 4) 
  cp(z, (z.reg.BC >> 8)) 
  
}
function op_b9(z)
{
     cy(z, 4) 
  cp(z, (z.reg.BC & 0xff)) 
  
}
function op_ba(z)
{
     cy(z, 4) 
  cp(z, (z.reg.DE >> 8)) 
  
}
function op_bb(z)
{
     cy(z, 4) 
  cp(z, (z.reg.DE & 0xff)) 
  
}
function op_bc(z)
{
     cy(z, 4) 
  cp(z, (z.reg.HL >> 8)) 
  
}
function op_bd(z)
{
     cy(z, 4) 
  cp(z, (z.reg.HL & 0xff)) 
  
}
function op_be(z)
{
     cy(z, 7) 
  cp(z, load8(z, z.reg.HL)) 
  
}
function op_bf(z)
{
     cy(z, 4) 
  cp(z, z.reg.A) 
  
}
function op_c0(z)
{
     cy(z, 5) 
 if (!(z.reg.fZ)) {z.reg.PC = pop(z, z.reg.PC) 
 cy(z, 6) 
 }  
}
function op_c1(z)
{
     cy(z, 10) 
 z.reg.BC =  pop(z, z.reg.BC) 
  
}
function op_c2(z)
{
     cy(z, 10) 
 jump(z, !(z.reg.fZ)) 
  
}
function op_c3(z)
{
     cy(z, 10) 
  jump(z, 1) 
  
}
function op_c4(z)
{
     cy(z, 10) 
  call(z, !(z.reg.fZ)) 
  
}
function op_c5(z)
{
     cy(z, 11) 
  push(z, z.reg.BC) 
  
}
function op_c6(z)
{
     cy(z, 7) 
  z.reg.A = add(z, z.reg.A, fetch_n(z), 0, 1) 
  
}
function op_c7(z)
{
     cy(z, 11) 
 push(z, z.reg.PC) 
 z.reg.PC =  0x00 
  
}
function op_c8(z)
{
     cy(z, 5) 
 if (z.reg.fZ) z.reg.PC = pop(z, z.reg.PC) 
 cy(z, 6) 
}  
function op_c9(z)
{
     cy(z, 10) 
 z.reg.PC =  pop(z, z.reg.PC) 
  
}
function op_ca(z)
{
     cy(z, 10) 
 jump(z, z.reg.fZ) 
  
}
function op_cb(z)
{
     return cb(z) 
}
function op_cc(z)
{
     cy(z, 10) 
  call(z, z.reg.fZ) 
  
}
function op_cd(z)
{
     cy(z, 10) 
  call(z, 1) 
  
}
function op_ce(z)
{
     cy(z, 7) 
  z.reg.A = add(z, z.reg.A, fetch_n(z), !!(z.reg.fC), 1) 
  
}
function op_cf(z)
{
     cy(z, 11) 
 push(z, z.reg.PC) 
 z.reg.PC =  0x08 
  
}
function op_d0(z)
{
     cy(z, 5) 
 if (!(z.reg.fC)) { z.reg.PC =  pop(z, z.reg.PC) 
 cy(z, 6) 
 }  
}
function op_d1(z)
{
     cy(z, 10) 
 z.reg.DE =  pop(z, z.reg.DE) 
  
}
function op_d2(z)
{
     cy(z, 10) 
 jump(z, !(z.reg.fC)) 
  
}
function op_d3(z)
{
     cy(z, 11) 
  zout(z, fetch_n(z), z.reg.A) 
  
}
function op_d4(z)
{
     cy(z, 10) 
  call(z, !(z.reg.fC)) 
  
}
function op_d5(z)
{
     cy(z, 11) 
  push(z, z.reg.DE) 
  
}
function op_d6(z)
{
     cy(z, 7) 
  z.reg.A = sub(z, z.reg.A, fetch_n(z), 0, 1) 
  
}
function op_d7(z)
{
     cy(z, 11) 
 push(z, z.reg.PC) 
 z.reg.PC =  0x10 
  
}
function op_d8(z)
{
     cy(z, 5) 
 if (z.reg.fC) { z.reg.PC =  pop(z, z.reg.PC) 
  cy(z, 6) 
 }  
}
function op_d9(z)
{
     cy(z, 4) 
  extmp = z.reg.BC; z.reg.BC =  z.reg.BCp; z.reg.BCp =  extmp 
 extmp = z.reg.DE; z.reg.DE =  z.reg.DEp; z.reg.DEp =  extmp 
 extmp = z.reg.HL; z.reg.HL =  z.reg.HLp; z.reg.HLp =  extmp 
  
}
function op_da(z)
{
     cy(z, 10) 
 jump(z, z.reg.fC) 
  
}
function op_db(z)
{
     cy(z, 11) 
  z.reg.A = zin(z, fetch_n(z), z.reg.A, 0) 
  
}
function op_dc(z)
{
     cy(z, 10) 
  call(z, z.reg.fC) 
  
}
function op_de(z)
{
     cy(z, 7) 
  z.reg.A = sub(z, z.reg.A, fetch_n(z), !!(z.reg.fC), 1) 
  
}
function op_df(z)
{
     cy(z, 11) 
 push(z, z.reg.PC) 
 z.reg.PC =  0x18 
  
}
function op_e0(z)
{
     cy(z, 5) 
 if (!(z.reg.fPV)) { z.reg.PC =  pop(z, z.reg.PC) 
 cy(z, 6) 
 }  
}
function op_e1(z)
{
     cy(z, 10) 
 z.reg.HL =  pop(z, z.reg.HL) 
  
}
function op_e2(z)
{
     cy(z, 10) 
 jump(z, !(z.reg.fPV)) 
  
}
function op_e3(z)
{
     cy(z, 19) 
  z.reg.HL =  ex_memsp(z, z.reg.HL) 
  
}
function op_e4(z)
{
     cy(z, 10) 
  call(z, !(z.reg.fPV)) 
  
}
function op_e5(z)
{
     cy(z, 11) 
  push(z, z.reg.HL) 
  
}
function op_e6(z)
{
     cy(z, 7) 
  and(z, fetch_n(z)) 
  
}
function op_e7(z)
{
     cy(z, 11) 
 push(z, z.reg.PC) 
 z.reg.PC =  0x20 
  
}
function op_e8(z)
{
     cy(z, 5) 
 if (z.reg.fPV) { z.reg.PC =  pop(z, z.reg.PC) 
 cy(z, 6) 
 }  
}
function op_e9(z)
{
     cy(z, 4) 
  z.reg.PC =  z.reg.HL 
  
}
function op_ea(z)
{
     cy(z, 10) 
 jump(z, z.reg.fPV) 
  
}
function op_eb(z)
{
     cy(z, 4) 
  extmp = z.reg.DE; z.reg.DE =  z.reg.HL; z.reg.HL =  extmp 
  
}
function op_ec(z)
{
     cy(z, 10) 
  call(z, z.reg.fPV) 
  
}
function op_ed(z)
{
     return ed(z) 
}
function op_ee(z)
{
     cy(z, 7) 
  xor(z, fetch_n(z)) 
  
}
function op_ef(z)
{
     cy(z, 11) 
 push(z, z.reg.PC) 
 z.reg.PC =  0x28 
  
}
function op_f0(z)
{
     cy(z, 5) 
 if (!(z.reg.fS)) { z.reg.PC =  pop(z, z.reg.PC) 
 cy(z, 6) 
 }  
}
function op_f1(z)
{
     cy(z, 10) 
 setAF(z, pop(z, getAF(z)) )
  
}
function op_f2(z)
{
     cy(z, 10) 
 jump(z, !(z.reg.fS)) 
  
}
function op_f3(z)
{
     cy(z, 4) 
  z.reg.IFF1 = z.reg.IFF2 = 0 
  
}
function op_f4(z)
{
     cy(z, 10) 
  call(z, !(z.reg.fS)) 
  
}
function op_f5(z)
{
     cy(z, 11) 
  push(z, getAF(z)) 
  
}
function op_f6(z)
{
     cy(z, 7) 
  or(z, fetch_n(z)) 
  
}
function op_f7(z)
{
     cy(z, 11) 
 push(z, z.reg.PC) 
 z.reg.PC =  0x30 
  
}
function op_f8(z)
{
     cy(z, 5) 
 if (z.reg.fS) { z.reg.PC =  pop(z, z.reg.PC) 
 cy(z, 6) 
 }  
}
function op_f9(z)
{
     cy(z, 6) 
  z.reg.SP =  z.reg.HL 
  
}
function op_fa(z)
{
     cy(z, 10) 
 jump(z, z.reg.fS) 
  
}
function op_fb(z)
{
     cy(z, 4) 
  z.reg.IFF1 = z.reg.IFF2 = 1 
  
}
function op_fc(z)
{
     cy(z, 10) 
  call(z, z.reg.fS) 
  
}
function op_fe(z)
{
     cy(z, 7) 
  cp(z, fetch_n(z)) 
  
}
function op_ff(z)
{
     cy(z, 11) 
 push(z, z.reg.PC) 
 z.reg.PC =  0x38 
  
}
function opcb_00(z)
{
     cy(z, 8) 
  qq =  rlc(z, (z.reg.BC >> 8)) ; z.reg.BC = (z.reg.BC &   0xff) | (qq << 8)
  
}
function opcb_01(z)
{
     cy(z, 8) 
  qq =  rlc(z, (z.reg.BC & 0xff)) ; z.reg.BC = (z.reg.BC & 0xff00) | qq
  
}
function opcb_02(z)
{
     cy(z, 8) 
  qq =  rlc(z, (z.reg.DE >> 8)) ; z.reg.DE = (z.reg.DE &   0xff) | (qq << 8)
  
}
function opcb_03(z)
{
     cy(z, 8) 
  qq =  rlc(z, (z.reg.DE & 0xff)) ; z.reg.DE = (z.reg.DE & 0xff00) | qq
  
}
function opcb_04(z)
{
     cy(z, 8) 
  qq =  rlc(z, (z.reg.HL >> 8)) ; z.reg.HL = (z.reg.HL &   0xff) | (qq << 8)
  
}
function opcb_05(z)
{
     cy(z, 8) 
  qq =  rlc(z, (z.reg.HL & 0xff)) ; z.reg.HL = (z.reg.HL & 0xff00) | qq
  
}
function opcb_06(z)
{
     cy(z, 15) 
  z.reg.tmp = load8(z, z.reg.HL) 
 z.reg.tmp = rlc(z, z.reg.tmp) 
 store8(z, z.reg.HL, z.reg.tmp) 
  
}
function opcb_07(z)
{
     cy(z, 8) 
  z.reg.A = rlc(z, z.reg.A) 
  
}
function opcb_08(z)
{
     cy(z, 8) 
  qq =  rrc(z, (z.reg.BC >> 8)) ; z.reg.BC = (z.reg.BC &   0xff) | (qq << 8)
  
}
function opcb_09(z)
{
     cy(z, 8) 
  qq =  rrc(z, (z.reg.BC & 0xff)) ; z.reg.BC = (z.reg.BC & 0xff00) | qq
  
}
function opcb_0a(z)
{
     cy(z, 8) 
  qq =  rrc(z, (z.reg.DE >> 8)) ; z.reg.DE = (z.reg.DE &   0xff) | (qq << 8)
  
}
function opcb_0b(z)
{
     cy(z, 8) 
  qq =  rrc(z, (z.reg.DE & 0xff)) ; z.reg.DE = (z.reg.DE & 0xff00) | qq
  
}
function opcb_0c(z)
{
     cy(z, 8) 
  qq =  rrc(z, (z.reg.HL >> 8)) ; z.reg.HL = (z.reg.HL &   0xff) | (qq << 8)
  
}
function opcb_0d(z)
{
     cy(z, 8) 
  qq =  rrc(z, (z.reg.HL & 0xff)) ; z.reg.HL = (z.reg.HL & 0xff00) | qq
  
}
function opcb_0e(z)
{
     cy(z, 15) 
  z.reg.tmp = load8(z, z.reg.HL) 
 z.reg.tmp = rrc(z, z.reg.tmp) 
 store8(z, z.reg.HL, z.reg.tmp) 
  
}
function opcb_0f(z)
{
     cy(z, 8) 
  z.reg.A = rrc(z, z.reg.A) 
  
}
function opcb_10(z)
{
     cy(z, 8) 
  qq =  rl(z, (z.reg.BC >> 8)) ; z.reg.BC = (z.reg.BC &   0xff) | (qq << 8)
  
}
function opcb_11(z)
{
     cy(z, 8) 
  qq =  rl(z, (z.reg.BC & 0xff)) ; z.reg.BC = (z.reg.BC & 0xff00) | qq
  
}
function opcb_12(z)
{
     cy(z, 8) 
  qq =  rl(z, (z.reg.DE >> 8)) ; z.reg.DE = (z.reg.DE &   0xff) | (qq << 8)
  
}
function opcb_13(z)
{
     cy(z, 8) 
  qq =  rl(z, (z.reg.DE & 0xff)) ; z.reg.DE = (z.reg.DE & 0xff00) | qq
  
}
function opcb_14(z)
{
     cy(z, 8) 
  qq =  rl(z, (z.reg.HL >> 8)) ; z.reg.HL = (z.reg.HL &   0xff) | (qq << 8)
  
}
function opcb_15(z)
{
     cy(z, 8) 
  qq =  rl(z, (z.reg.HL & 0xff)) ; z.reg.HL = (z.reg.HL & 0xff00) | qq
  
}
function opcb_16(z)
{
     cy(z, 15) 
  z.reg.tmp = load8(z, z.reg.HL) 
 z.reg.tmp = rl(z, z.reg.tmp) 
 store8(z, z.reg.HL, z.reg.tmp) 
  
}
function opcb_17(z)
{
     cy(z, 8) 
  z.reg.A = rl(z, z.reg.A) 
  
}
function opcb_18(z)
{
     cy(z, 8) 
  qq =  rr(z, (z.reg.BC >> 8)) ; z.reg.BC = (z.reg.BC &   0xff) | (qq << 8)
  
}
function opcb_19(z)
{
     cy(z, 8) 
  qq =  rr(z, (z.reg.BC & 0xff)) ; z.reg.BC = (z.reg.BC & 0xff00) | qq
  
}
function opcb_1a(z)
{
     cy(z, 8) 
  qq =  rr(z, (z.reg.DE >> 8)) ; z.reg.DE = (z.reg.DE &   0xff) | (qq << 8)
  
}
function opcb_1b(z)
{
     cy(z, 8) 
  qq =  rr(z, (z.reg.DE & 0xff)) ; z.reg.DE = (z.reg.DE & 0xff00) | qq
  
}
function opcb_1c(z)
{
     cy(z, 8) 
  qq =  rr(z, (z.reg.HL >> 8)) ; z.reg.HL = (z.reg.HL &   0xff) | (qq << 8)
  
}
function opcb_1d(z)
{
     cy(z, 8) 
  qq =  rr(z, (z.reg.HL & 0xff)) ; z.reg.HL = (z.reg.HL & 0xff00) | qq
  
}
function opcb_1e(z)
{
     cy(z, 15) 
  z.reg.tmp = load8(z, z.reg.HL) 
 z.reg.tmp = rr(z, z.reg.tmp) 
 store8(z, z.reg.HL, z.reg.tmp) 
  
}
function opcb_1f(z)
{
     cy(z, 8) 
  z.reg.A = rr(z, z.reg.A) 
  
}
function opcb_20(z)
{
     cy(z, 8) 
  qq =  sla(z, (z.reg.BC >> 8)) ; z.reg.BC = (z.reg.BC &   0xff) | (qq << 8)
  
}
function opcb_21(z)
{
     cy(z, 8) 
  qq =  sla(z, (z.reg.BC & 0xff)) ; z.reg.BC = (z.reg.BC & 0xff00) | qq
  
}
function opcb_22(z)
{
     cy(z, 8) 
  qq =  sla(z, (z.reg.DE >> 8)) ; z.reg.DE = (z.reg.DE &   0xff) | (qq << 8)
  
}
function opcb_23(z)
{
     cy(z, 8) 
  qq =  sla(z, (z.reg.DE & 0xff)) ; z.reg.DE = (z.reg.DE & 0xff00) | qq
  
}
function opcb_24(z)
{
     cy(z, 8) 
  qq =  sla(z, (z.reg.HL >> 8)) ; z.reg.HL = (z.reg.HL &   0xff) | (qq << 8)
  
}
function opcb_25(z)
{
     cy(z, 8) 
  qq =  sla(z, (z.reg.HL & 0xff)) ; z.reg.HL = (z.reg.HL & 0xff00) | qq
  
}
function opcb_26(z)
{
     cy(z, 15) 
  z.reg.tmp = load8(z, z.reg.HL) 
 z.reg.tmp = sla(z, z.reg.tmp) 
 store8(z, z.reg.HL, z.reg.tmp) 
  
}
function opcb_27(z)
{
     cy(z, 8) 
  z.reg.A = sla(z, z.reg.A) 
  
}
function opcb_28(z)
{
     cy(z, 8) 
  qq =  sra(z, (z.reg.BC >> 8)) ; z.reg.BC = (z.reg.BC &   0xff) | (qq << 8)
  
}
function opcb_29(z)
{
     cy(z, 8) 
  qq =  sra(z, (z.reg.BC & 0xff)) ; z.reg.BC = (z.reg.BC & 0xff00) | qq
  
}
function opcb_2a(z)
{
     cy(z, 8) 
  qq =  sra(z, (z.reg.DE >> 8)) ; z.reg.DE = (z.reg.DE &   0xff) | (qq << 8)
  
}
function opcb_2b(z)
{
     cy(z, 8) 
  qq =  sra(z, (z.reg.DE & 0xff)) ; z.reg.DE = (z.reg.DE & 0xff00) | qq
  
}
function opcb_2c(z)
{
     cy(z, 8) 
  qq =  sra(z, (z.reg.HL >> 8)) ; z.reg.HL = (z.reg.HL &   0xff) | (qq << 8)
  
}
function opcb_2d(z)
{
     cy(z, 8) 
  qq =  sra(z, (z.reg.HL & 0xff)) ; z.reg.HL = (z.reg.HL & 0xff00) | qq
  
}
function opcb_2e(z)
{
     cy(z, 15) 
  z.reg.tmp = load8(z, z.reg.HL) 
 z.reg.tmp = sra(z, z.reg.tmp) 
 store8(z, z.reg.HL, z.reg.tmp) 
  
}
function opcb_2f(z)
{
     cy(z, 8) 
  z.reg.A = sra(z, z.reg.A) 
  
}
function opcb_30(z)
{
     cy(z, 8) 
  qq =  sl1(z, (z.reg.BC >> 8)) ; z.reg.BC = (z.reg.BC &   0xff) | (qq << 8)
  
}
function opcb_31(z)
{
     cy(z, 8) 
  qq =  sl1(z, (z.reg.BC & 0xff)) ; z.reg.BC = (z.reg.BC & 0xff00) | qq
  
}
function opcb_32(z)
{
     cy(z, 8) 
  qq =  sl1(z, (z.reg.DE >> 8)) ; z.reg.DE = (z.reg.DE &   0xff) | (qq << 8)
  
}
function opcb_33(z)
{
     cy(z, 8) 
  qq =  sl1(z, (z.reg.DE & 0xff)) ; z.reg.DE = (z.reg.DE & 0xff00) | qq
  
}
function opcb_34(z)
{
     cy(z, 8) 
  qq =  sl1(z, (z.reg.HL >> 8)) ; z.reg.HL = (z.reg.HL &   0xff) | (qq << 8)
  
}
function opcb_35(z)
{
     cy(z, 8) 
  qq =  sl1(z, (z.reg.HL & 0xff)) ; z.reg.HL = (z.reg.HL & 0xff00) | qq
  
}
function opcb_36(z)
{
     cy(z, 15) 
  z.reg.tmp = load8(z, z.reg.HL) 
 z.reg.tmp = sl1(z, z.reg.tmp) 
 store8(z, z.reg.HL, z.reg.tmp) 
  
}
function opcb_37(z)
{
     cy(z, 8) 
  z.reg.A = sl1(z, z.reg.A) 
  
}
function opcb_38(z)
{
     cy(z, 8) 
  qq =  srl(z, (z.reg.BC >> 8)) ; z.reg.BC = (z.reg.BC &   0xff) | (qq << 8)
  
}
function opcb_39(z)
{
     cy(z, 8) 
  qq =  srl(z, (z.reg.BC & 0xff)) ; z.reg.BC = (z.reg.BC & 0xff00) | qq
  
}
function opcb_3a(z)
{
     cy(z, 8) 
  qq =  srl(z, (z.reg.DE >> 8)) ; z.reg.DE = (z.reg.DE &   0xff) | (qq << 8)
  
}
function opcb_3b(z)
{
     cy(z, 8) 
  qq =  srl(z, (z.reg.DE & 0xff)) ; z.reg.DE = (z.reg.DE & 0xff00) | qq
  
}
function opcb_3c(z)
{
     cy(z, 8) 
  qq =  srl(z, (z.reg.HL >> 8)) ; z.reg.HL = (z.reg.HL &   0xff) | (qq << 8)
  
}
function opcb_3d(z)
{
     cy(z, 8) 
  qq =  srl(z, (z.reg.HL & 0xff)) ; z.reg.HL = (z.reg.HL & 0xff00) | qq
  
}
function opcb_3e(z)
{
     cy(z, 15) 
  z.reg.tmp = load8(z, z.reg.HL) 
 z.reg.tmp = srl(z, z.reg.tmp) 
 store8(z, z.reg.HL, z.reg.tmp) 
  
}
function opcb_3f(z)
{
     cy(z, 8) 
  z.reg.A = srl(z, z.reg.A) 
  
}
function opcb_40(z)
{
     cy(z, 8) 
  bit(z, (z.reg.BC >> 8), 0) 
  
}
function opcb_41(z)
{
     cy(z, 8) 
  bit(z, (z.reg.BC & 0xff), 0) 
  
}
function opcb_42(z)
{
     cy(z, 8) 
  bit(z, (z.reg.DE >> 8), 0) 
  
}
function opcb_43(z)
{
     cy(z, 8) 
  bit(z, (z.reg.DE & 0xff), 0) 
  
}
function opcb_44(z)
{
     cy(z, 8) 
  bit(z, (z.reg.HL >> 8), 0) 
  
}
function opcb_45(z)
{
     cy(z, 8) 
  bit(z, (z.reg.HL & 0xff), 0) 
  
}
function opcb_46(z)
{
     cy(z, 12) 
  bit(z, load8(z, z.reg.HL), 0) 
  
}
function opcb_47(z)
{
     cy(z, 8) 
  bit(z, z.reg.A, 0) 
  
}
function opcb_48(z)
{
     cy(z, 8) 
  bit(z, (z.reg.BC >> 8), 1) 
  
}
function opcb_49(z)
{
     cy(z, 8) 
  bit(z, (z.reg.BC & 0xff), 1) 
  
}
function opcb_4a(z)
{
     cy(z, 8) 
  bit(z, (z.reg.DE >> 8), 1) 
  
}
function opcb_4b(z)
{
     cy(z, 8) 
  bit(z, (z.reg.DE & 0xff), 1) 
  
}
function opcb_4c(z)
{
     cy(z, 8) 
  bit(z, (z.reg.HL >> 8), 1) 
  
}
function opcb_4d(z)
{
     cy(z, 8) 
  bit(z, (z.reg.HL & 0xff), 1) 
  
}
function opcb_4e(z)
{
     cy(z, 12) 
  bit(z, load8(z, z.reg.HL), 1) 
  
}
function opcb_4f(z)
{
     cy(z, 8) 
  bit(z, z.reg.A, 1) 
  
}
function opcb_50(z)
{
     cy(z, 8) 
  bit(z, (z.reg.BC >> 8), 2) 
  
}
function opcb_51(z)
{
     cy(z, 8) 
  bit(z, (z.reg.BC & 0xff), 2) 
  
}
function opcb_52(z)
{
     cy(z, 8) 
  bit(z, (z.reg.DE >> 8), 2) 
  
}
function opcb_53(z)
{
     cy(z, 8) 
  bit(z, (z.reg.DE & 0xff), 2) 
  
}
function opcb_54(z)
{
     cy(z, 8) 
  bit(z, (z.reg.HL >> 8), 2) 
  
}
function opcb_55(z)
{
     cy(z, 8) 
  bit(z, (z.reg.HL & 0xff), 2) 
  
}
function opcb_56(z)
{
     cy(z, 12) 
  bit(z, load8(z, z.reg.HL), 2) 
  
}
function opcb_57(z)
{
     cy(z, 8) 
  bit(z, z.reg.A, 2) 
  
}
function opcb_58(z)
{
     cy(z, 8) 
  bit(z, (z.reg.BC >> 8), 3) 
  
}
function opcb_59(z)
{
     cy(z, 8) 
  bit(z, (z.reg.BC & 0xff), 3) 
  
}
function opcb_5a(z)
{
     cy(z, 8) 
  bit(z, (z.reg.DE >> 8), 3) 
  
}
function opcb_5b(z)
{
     cy(z, 8) 
  bit(z, (z.reg.DE & 0xff), 3) 
  
}
function opcb_5c(z)
{
     cy(z, 8) 
  bit(z, (z.reg.HL >> 8), 3) 
  
}
function opcb_5d(z)
{
     cy(z, 8) 
  bit(z, (z.reg.HL & 0xff), 3) 
  
}
function opcb_5e(z)
{
     cy(z, 12) 
  bit(z, load8(z, z.reg.HL), 3) 
  
}
function opcb_5f(z)
{
     cy(z, 8) 
  bit(z, z.reg.A, 3) 
  
}
function opcb_60(z)
{
     cy(z, 8) 
  bit(z, (z.reg.BC >> 8), 4) 
  
}
function opcb_61(z)
{
     cy(z, 8) 
  bit(z, (z.reg.BC & 0xff), 4) 
  
}
function opcb_62(z)
{
     cy(z, 8) 
  bit(z, (z.reg.DE >> 8), 4) 
  
}
function opcb_63(z)
{
     cy(z, 8) 
  bit(z, (z.reg.DE & 0xff), 4) 
  
}
function opcb_64(z)
{
     cy(z, 8) 
  bit(z, (z.reg.HL >> 8), 4) 
  
}
function opcb_65(z)
{
     cy(z, 8) 
  bit(z, (z.reg.HL & 0xff), 4) 
  
}
function opcb_66(z)
{
     cy(z, 12) 
  bit(z, load8(z, z.reg.HL), 4) 
  
}
function opcb_67(z)
{
     cy(z, 8) 
  bit(z, z.reg.A, 4) 
  
}
function opcb_68(z)
{
     cy(z, 8) 
  bit(z, (z.reg.BC >> 8), 5) 
  
}
function opcb_69(z)
{
     cy(z, 8) 
  bit(z, (z.reg.BC & 0xff), 5) 
  
}
function opcb_6a(z)
{
     cy(z, 8) 
  bit(z, (z.reg.DE >> 8), 5) 
  
}
function opcb_6b(z)
{
     cy(z, 8) 
  bit(z, (z.reg.DE & 0xff), 5) 
  
}
function opcb_6c(z)
{
     cy(z, 8) 
  bit(z, (z.reg.HL >> 8), 5) 
  
}
function opcb_6d(z)
{
     cy(z, 8) 
  bit(z, (z.reg.HL & 0xff), 5) 
  
}
function opcb_6e(z)
{
     cy(z, 12) 
  bit(z, load8(z, z.reg.HL), 5) 
  
}
function opcb_6f(z)
{
     cy(z, 8) 
  bit(z, z.reg.A, 5) 
  
}
function opcb_70(z)
{
     cy(z, 8) 
  bit(z, (z.reg.BC >> 8), 6) 
  
}
function opcb_71(z)
{
     cy(z, 8) 
  bit(z, (z.reg.BC & 0xff), 6) 
  
}
function opcb_72(z)
{
     cy(z, 8) 
  bit(z, (z.reg.DE >> 8), 6) 
  
}
function opcb_73(z)
{
     cy(z, 8) 
  bit(z, (z.reg.DE & 0xff), 6) 
  
}
function opcb_74(z)
{
     cy(z, 8) 
  bit(z, (z.reg.HL >> 8), 6) 
  
}
function opcb_75(z)
{
     cy(z, 8) 
  bit(z, (z.reg.HL & 0xff), 6) 
  
}
function opcb_76(z)
{
     cy(z, 12) 
  bit(z, load8(z, z.reg.HL), 6) 
  
}
function opcb_77(z)
{
     cy(z, 8) 
  bit(z, z.reg.A, 6) 
  
}
function opcb_78(z)
{
     cy(z, 8) 
  bit(z, (z.reg.BC >> 8), 7) 
  
}
function opcb_79(z)
{
     cy(z, 8) 
  bit(z, (z.reg.BC & 0xff), 7) 
  
}
function opcb_7a(z)
{
     cy(z, 8) 
  bit(z, (z.reg.DE >> 8), 7) 
  
}
function opcb_7b(z)
{
     cy(z, 8) 
  bit(z, (z.reg.DE & 0xff), 7) 
  
}
function opcb_7c(z)
{
     cy(z, 8) 
  bit(z, (z.reg.HL >> 8), 7) 
  
}
function opcb_7d(z)
{
     cy(z, 8) 
  bit(z, (z.reg.HL & 0xff), 7) 
  
}
function opcb_7e(z)
{
     cy(z, 12) 
  bit(z, load8(z, z.reg.HL), 7) 
  
}
function opcb_7f(z)
{
     cy(z, 8) 
  bit(z, z.reg.A, 7) 
  
}
function opcb_80(z)
{
     cy(z, 8) 
  qq =  res(z, (z.reg.BC >> 8), 0) ; z.reg.BC = (z.reg.BC &   0xff) | (qq << 8)
  
}
function opcb_81(z)
{
     cy(z, 8) 
  qq =  res(z, (z.reg.BC & 0xff), 0) ; z.reg.BC = (z.reg.BC & 0xff00) | qq
  
}
function opcb_82(z)
{
     cy(z, 8) 
  qq =  res(z, (z.reg.DE >> 8), 0) ; z.reg.DE = (z.reg.DE &   0xff) | (qq << 8)
  
}
function opcb_83(z)
{
     cy(z, 8) 
  qq =  res(z, (z.reg.DE & 0xff), 0) ; z.reg.DE = (z.reg.DE & 0xff00) | qq
  
}
function opcb_84(z)
{
     cy(z, 8) 
  qq =  res(z, (z.reg.HL >> 8), 0) ; z.reg.HL = (z.reg.HL &   0xff) | (qq << 8)
  
}
function opcb_85(z)
{
     cy(z, 8) 
  qq =  res(z, (z.reg.HL & 0xff), 0) ; z.reg.HL = (z.reg.HL & 0xff00) | qq
  
}
function opcb_86(z)
{
     cy(z, 15) 
  z.reg.tmp = load8(z, z.reg.HL) 
 z.reg.tmp = res(z, z.reg.tmp ,0) 
 store8(z, z.reg.HL, z.reg.tmp) 
  
}
function opcb_87(z)
{
     cy(z, 8) 
  z.reg.A = res(z, z.reg.A, 0) 
  
}
function opcb_88(z)
{
     cy(z, 8) 
  qq =  res(z, (z.reg.BC >> 8), 1) ; z.reg.BC = (z.reg.BC &   0xff) | (qq << 8)
  
}
function opcb_89(z)
{
     cy(z, 8) 
  qq =  res(z, (z.reg.BC & 0xff), 1) ; z.reg.BC = (z.reg.BC & 0xff00) | qq
  
}
function opcb_8a(z)
{
     cy(z, 8) 
  qq =  res(z, (z.reg.DE >> 8), 1) ; z.reg.DE = (z.reg.DE &   0xff) | (qq << 8)
  
}
function opcb_8b(z)
{
     cy(z, 8) 
  qq =  res(z, (z.reg.DE & 0xff), 1) ; z.reg.DE = (z.reg.DE & 0xff00) | qq
  
}
function opcb_8c(z)
{
     cy(z, 8) 
  qq =  res(z, (z.reg.HL >> 8), 1) ; z.reg.HL = (z.reg.HL &   0xff) | (qq << 8)
  
}
function opcb_8d(z)
{
     cy(z, 8) 
  qq =  res(z, (z.reg.HL & 0xff), 1) ; z.reg.HL = (z.reg.HL & 0xff00) | qq
  
}
function opcb_8e(z)
{
     cy(z, 15) 
  z.reg.tmp = load8(z, z.reg.HL) 
 z.reg.tmp = res(z, z.reg.tmp ,1) 
 store8(z, z.reg.HL, z.reg.tmp) 
  
}
function opcb_8f(z)
{
     cy(z, 8) 
  z.reg.A = res(z, z.reg.A, 1) 
  
}
function opcb_90(z)
{
     cy(z, 8) 
  qq =  res(z, (z.reg.BC >> 8), 2) ; z.reg.BC = (z.reg.BC &   0xff) | (qq << 8)
  
}
function opcb_91(z)
{
     cy(z, 8) 
  qq =  res(z, (z.reg.BC & 0xff), 2) ; z.reg.BC = (z.reg.BC & 0xff00) | qq
  
}
function opcb_92(z)
{
     cy(z, 8) 
  qq =  res(z, (z.reg.DE >> 8), 2) ; z.reg.DE = (z.reg.DE &   0xff) | (qq << 8)
  
}
function opcb_93(z)
{
     cy(z, 8) 
  qq =  res(z, (z.reg.DE & 0xff), 2) ; z.reg.DE = (z.reg.DE & 0xff00) | qq
  
}
function opcb_94(z)
{
     cy(z, 8) 
  qq =  res(z, (z.reg.HL >> 8), 2) ; z.reg.HL = (z.reg.HL &   0xff) | (qq << 8)
  
}
function opcb_95(z)
{
     cy(z, 8) 
  qq =  res(z, (z.reg.HL & 0xff), 2) ; z.reg.HL = (z.reg.HL & 0xff00) | qq
  
}
function opcb_96(z)
{
     cy(z, 15) 
  z.reg.tmp = load8(z, z.reg.HL) 
 z.reg.tmp = res(z, z.reg.tmp ,2) 
 store8(z, z.reg.HL, z.reg.tmp) 
  
}
function opcb_97(z)
{
     cy(z, 8) 
  z.reg.A = res(z, z.reg.A, 2) 
  
}
function opcb_98(z)
{
     cy(z, 8) 
  qq =  res(z, (z.reg.BC >> 8), 3) ; z.reg.BC = (z.reg.BC &   0xff) | (qq << 8)
  
}
function opcb_99(z)
{
     cy(z, 8) 
  qq =  res(z, (z.reg.BC & 0xff), 3) ; z.reg.BC = (z.reg.BC & 0xff00) | qq
  
}
function opcb_9a(z)
{
     cy(z, 8) 
  qq =  res(z, (z.reg.DE >> 8), 3) ; z.reg.DE = (z.reg.DE &   0xff) | (qq << 8)
  
}
function opcb_9b(z)
{
     cy(z, 8) 
  qq =  res(z, (z.reg.DE & 0xff), 3) ; z.reg.DE = (z.reg.DE & 0xff00) | qq
  
}
function opcb_9c(z)
{
     cy(z, 8) 
  qq =  res(z, (z.reg.HL >> 8), 3) ; z.reg.HL = (z.reg.HL &   0xff) | (qq << 8)
  
}
function opcb_9d(z)
{
     cy(z, 8) 
  qq =  res(z, (z.reg.HL & 0xff), 3) ; z.reg.HL = (z.reg.HL & 0xff00) | qq
  
}
function opcb_9e(z)
{
     cy(z, 15) 
  z.reg.tmp = load8(z, z.reg.HL) 
 z.reg.tmp = res(z, z.reg.tmp ,3) 
 store8(z, z.reg.HL, z.reg.tmp) 
  
}
function opcb_9f(z)
{
     cy(z, 8) 
  z.reg.A = res(z, z.reg.A, 3) 
  
}
function opcb_a0(z)
{
     cy(z, 8) 
  qq =  res(z, (z.reg.BC >> 8), 4) ; z.reg.BC = (z.reg.BC &   0xff) | (qq << 8)
  
}
function opcb_a1(z)
{
     cy(z, 8) 
  qq =  res(z, (z.reg.BC & 0xff), 4) ; z.reg.BC = (z.reg.BC & 0xff00) | qq
  
}
function opcb_a2(z)
{
     cy(z, 8) 
  qq =  res(z, (z.reg.DE >> 8), 4) ; z.reg.DE = (z.reg.DE &   0xff) | (qq << 8)
  
}
function opcb_a3(z)
{
     cy(z, 8) 
  qq =  res(z, (z.reg.DE & 0xff), 4) ; z.reg.DE = (z.reg.DE & 0xff00) | qq
  
}
function opcb_a4(z)
{
     cy(z, 8) 
  qq =  res(z, (z.reg.HL >> 8), 4) ; z.reg.HL = (z.reg.HL &   0xff) | (qq << 8)
  
}
function opcb_a5(z)
{
     cy(z, 8) 
  qq =  res(z, (z.reg.HL & 0xff), 4) ; z.reg.HL = (z.reg.HL & 0xff00) | qq
  
}
function opcb_a6(z)
{
     cy(z, 15) 
  z.reg.tmp = load8(z, z.reg.HL) 
 z.reg.tmp = res(z, z.reg.tmp ,4) 
 store8(z, z.reg.HL, z.reg.tmp) 
  
}
function opcb_a7(z)
{
     cy(z, 8) 
  z.reg.A = res(z, z.reg.A, 4) 
  
}
function opcb_a8(z)
{
     cy(z, 8) 
  qq =  res(z, (z.reg.BC >> 8), 5) ; z.reg.BC = (z.reg.BC &   0xff) | (qq << 8)
  
}
function opcb_a9(z)
{
     cy(z, 8) 
  qq =  res(z, (z.reg.BC & 0xff), 5) ; z.reg.BC = (z.reg.BC & 0xff00) | qq
  
}
function opcb_aa(z)
{
     cy(z, 8) 
  qq =  res(z, (z.reg.DE >> 8), 5) ; z.reg.DE = (z.reg.DE &   0xff) | (qq << 8)
  
}
function opcb_ab(z)
{
     cy(z, 8) 
  qq =  res(z, (z.reg.DE & 0xff), 5) ; z.reg.DE = (z.reg.DE & 0xff00) | qq
  
}
function opcb_ac(z)
{
     cy(z, 8) 
  qq =  res(z, (z.reg.HL >> 8), 5) ; z.reg.HL = (z.reg.HL &   0xff) | (qq << 8)
  
}
function opcb_ad(z)
{
     cy(z, 8) 
  qq =  res(z, (z.reg.HL & 0xff), 5) ; z.reg.HL = (z.reg.HL & 0xff00) | qq
  
}
function opcb_ae(z)
{
     cy(z, 15) 
  z.reg.tmp = load8(z, z.reg.HL) 
 z.reg.tmp = res(z, z.reg.tmp ,5) 
 store8(z, z.reg.HL, z.reg.tmp) 
  
}
function opcb_af(z)
{
     cy(z, 8) 
  z.reg.A = res(z, z.reg.A, 5) 
  
}
function opcb_b0(z)
{
     cy(z, 8) 
  qq =  res(z, (z.reg.BC >> 8), 6) ; z.reg.BC = (z.reg.BC &   0xff) | (qq << 8)
  
}
function opcb_b1(z)
{
     cy(z, 8) 
  qq =  res(z, (z.reg.BC & 0xff), 6) ; z.reg.BC = (z.reg.BC & 0xff00) | qq
  
}
function opcb_b2(z)
{
     cy(z, 8) 
  qq =  res(z, (z.reg.DE >> 8), 6) ; z.reg.DE = (z.reg.DE &   0xff) | (qq << 8)
  
}
function opcb_b3(z)
{
     cy(z, 8) 
  qq =  res(z, (z.reg.DE & 0xff), 6) ; z.reg.DE = (z.reg.DE & 0xff00) | qq
  
}
function opcb_b4(z)
{
     cy(z, 8) 
  qq =  res(z, (z.reg.HL >> 8), 6) ; z.reg.HL = (z.reg.HL &   0xff) | (qq << 8)
  
}
function opcb_b5(z)
{
     cy(z, 8) 
  qq =  res(z, (z.reg.HL & 0xff), 6) ; z.reg.HL = (z.reg.HL & 0xff00) | qq
  
}
function opcb_b6(z)
{
     cy(z, 15) 
  z.reg.tmp = load8(z, z.reg.HL) 
 z.reg.tmp = res(z, z.reg.tmp ,6) 
 store8(z, z.reg.HL, z.reg.tmp) 
  
}
function opcb_b7(z)
{
     cy(z, 8) 
  z.reg.A = res(z, z.reg.A, 6) 
  
}
function opcb_b8(z)
{
     cy(z, 8) 
  qq =  res(z, (z.reg.BC >> 8), 7) ; z.reg.BC = (z.reg.BC &   0xff) | (qq << 8)
  
}
function opcb_b9(z)
{
     cy(z, 8) 
  qq =  res(z, (z.reg.BC & 0xff), 7) ; z.reg.BC = (z.reg.BC & 0xff00) | qq
  
}
function opcb_ba(z)
{
     cy(z, 8) 
  qq =  res(z, (z.reg.DE >> 8), 7) ; z.reg.DE = (z.reg.DE &   0xff) | (qq << 8)
  
}
function opcb_bb(z)
{
     cy(z, 8) 
  qq =  res(z, (z.reg.DE & 0xff), 7) ; z.reg.DE = (z.reg.DE & 0xff00) | qq
  
}
function opcb_bc(z)
{
     cy(z, 8) 
  qq =  res(z, (z.reg.HL >> 8), 7) ; z.reg.HL = (z.reg.HL &   0xff) | (qq << 8)
  
}
function opcb_bd(z)
{
     cy(z, 8) 
  qq =  res(z, (z.reg.HL & 0xff), 7) ; z.reg.HL = (z.reg.HL & 0xff00) | qq
  
}
function opcb_be(z)
{
     cy(z, 15) 
  z.reg.tmp = load8(z, z.reg.HL) 
 z.reg.tmp = res(z, z.reg.tmp ,7) 
 store8(z, z.reg.HL, z.reg.tmp) 
  
}
function opcb_bf(z)
{
     cy(z, 8) 
  z.reg.A = res(z, z.reg.A, 7) 
  
}
function opcb_c0(z)
{
     cy(z, 8) 
  qq =  set(z, (z.reg.BC >> 8), 0) ; z.reg.BC = (z.reg.BC &   0xff) | (qq << 8)
  
}
function opcb_c1(z)
{
     cy(z, 8) 
  qq =  set(z, (z.reg.BC & 0xff), 0) ; z.reg.BC = (z.reg.BC & 0xff00) | qq
  
}
function opcb_c2(z)
{
     cy(z, 8) 
  qq =  set(z, (z.reg.DE >> 8), 0) ; z.reg.DE = (z.reg.DE &   0xff) | (qq << 8)
  
}
function opcb_c3(z)
{
     cy(z, 8) 
  qq =  set(z, (z.reg.DE & 0xff), 0) ; z.reg.DE = (z.reg.DE & 0xff00) | qq
  
}
function opcb_c4(z)
{
     cy(z, 8) 
  qq =  set(z, (z.reg.HL >> 8), 0) ; z.reg.HL = (z.reg.HL &   0xff) | (qq << 8)
  
}
function opcb_c5(z)
{
     cy(z, 8) 
  qq =  set(z, (z.reg.HL & 0xff), 0) ; z.reg.HL = (z.reg.HL & 0xff00) | qq
  
}
function opcb_c6(z)
{
     cy(z, 15) 
  z.reg.tmp = load8(z, z.reg.HL) 
 z.reg.tmp = set(z, z.reg.tmp ,0) 
 store8(z, z.reg.HL, z.reg.tmp) 
  
}
function opcb_c7(z)
{
     cy(z, 8) 
  z.reg.A = set(z, z.reg.A, 0) 
  
}
function opcb_c8(z)
{
     cy(z, 8) 
  qq =  set(z, (z.reg.BC >> 8), 1) ; z.reg.BC = (z.reg.BC &   0xff) | (qq << 8)
  
}
function opcb_c9(z)
{
     cy(z, 8) 
  qq =  set(z, (z.reg.BC & 0xff), 1) ; z.reg.BC = (z.reg.BC & 0xff00) | qq
  
}
function opcb_ca(z)
{
     cy(z, 8) 
  qq =  set(z, (z.reg.DE >> 8), 1) ; z.reg.DE = (z.reg.DE &   0xff) | (qq << 8)
  
}
function opcb_cb(z)
{
     cy(z, 8) 
  qq =  set(z, (z.reg.DE & 0xff), 1) ; z.reg.DE = (z.reg.DE & 0xff00) | qq
  
}
function opcb_cc(z)
{
     cy(z, 8) 
  qq =  set(z, (z.reg.HL >> 8), 1) ; z.reg.HL = (z.reg.HL &   0xff) | (qq << 8)
  
}
function opcb_cd(z)
{
     cy(z, 8) 
  qq =  set(z, (z.reg.HL & 0xff), 1) ; z.reg.HL = (z.reg.HL & 0xff00) | qq
  
}
function opcb_ce(z)
{
     cy(z, 15) 
  z.reg.tmp = load8(z, z.reg.HL) 
 z.reg.tmp = set(z, z.reg.tmp ,1) 
 store8(z, z.reg.HL, z.reg.tmp) 
  
}
function opcb_cf(z)
{
     cy(z, 8) 
  z.reg.A = set(z, z.reg.A, 1) 
  
}
function opcb_d0(z)
{
     cy(z, 8) 
  qq =  set(z, (z.reg.BC >> 8), 2) ; z.reg.BC = (z.reg.BC &   0xff) | (qq << 8)
  
}
function opcb_d1(z)
{
     cy(z, 8) 
  qq =  set(z, (z.reg.BC & 0xff), 2) ; z.reg.BC = (z.reg.BC & 0xff00) | qq
  
}
function opcb_d2(z)
{
     cy(z, 8) 
  qq =  set(z, (z.reg.DE >> 8), 2) ; z.reg.DE = (z.reg.DE &   0xff) | (qq << 8)
  
}
function opcb_d3(z)
{
     cy(z, 8) 
  qq =  set(z, (z.reg.DE & 0xff), 2) ; z.reg.DE = (z.reg.DE & 0xff00) | qq
  
}
function opcb_d4(z)
{
     cy(z, 8) 
  qq =  set(z, (z.reg.HL >> 8), 2) ; z.reg.HL = (z.reg.HL &   0xff) | (qq << 8)
  
}
function opcb_d5(z)
{
     cy(z, 8) 
  qq =  set(z, (z.reg.HL & 0xff), 2) ; z.reg.HL = (z.reg.HL & 0xff00) | qq
  
}
function opcb_d6(z)
{
     cy(z, 15) 
  z.reg.tmp = load8(z, z.reg.HL) 
 z.reg.tmp = set(z, z.reg.tmp ,2) 
 store8(z, z.reg.HL, z.reg.tmp) 
  
}
function opcb_d7(z)
{
     cy(z, 8) 
  z.reg.A = set(z, z.reg.A, 2) 
  
}
function opcb_d8(z)
{
     cy(z, 8) 
  qq =  set(z, (z.reg.BC >> 8), 3) ; z.reg.BC = (z.reg.BC &   0xff) | (qq << 8)
  
}
function opcb_d9(z)
{
     cy(z, 8) 
  qq =  set(z, (z.reg.BC & 0xff), 3) ; z.reg.BC = (z.reg.BC & 0xff00) | qq
  
}
function opcb_da(z)
{
     cy(z, 8) 
  qq =  set(z, (z.reg.DE >> 8), 3) ; z.reg.DE = (z.reg.DE &   0xff) | (qq << 8)
  
}
function opcb_db(z)
{
     cy(z, 8) 
  qq =  set(z, (z.reg.DE & 0xff), 3) ; z.reg.DE = (z.reg.DE & 0xff00) | qq
  
}
function opcb_dc(z)
{
     cy(z, 8) 
  qq =  set(z, (z.reg.HL >> 8), 3) ; z.reg.HL = (z.reg.HL &   0xff) | (qq << 8)
  
}
function opcb_dd(z)
{
     cy(z, 8) 
  qq =  set(z, (z.reg.HL & 0xff), 3) ; z.reg.HL = (z.reg.HL & 0xff00) | qq
  
}
function opcb_de(z)
{
     cy(z, 15) 
  z.reg.tmp = load8(z, z.reg.HL) 
 z.reg.tmp = set(z, z.reg.tmp ,3) 
 store8(z, z.reg.HL, z.reg.tmp) 
  
}
function opcb_default(z)
{
      
}
function opcb_df(z)
{
     cy(z, 8) 
  z.reg.A = set(z, z.reg.A, 3) 
  
}
function opcb_e0(z)
{
     cy(z, 8) 
  qq =  set(z, (z.reg.BC >> 8), 4) ; z.reg.BC = (z.reg.BC &   0xff) | (qq << 8)
  
}
function opcb_e1(z)
{
     cy(z, 8) 
  qq =  set(z, (z.reg.BC & 0xff), 4) ; z.reg.BC = (z.reg.BC & 0xff00) | qq
  
}
function opcb_e2(z)
{
     cy(z, 8) 
  qq =  set(z, (z.reg.DE >> 8), 4) ; z.reg.DE = (z.reg.DE &   0xff) | (qq << 8)
  
}
function opcb_e3(z)
{
     cy(z, 8) 
  qq =  set(z, (z.reg.DE & 0xff), 4) ; z.reg.DE = (z.reg.DE & 0xff00) | qq
  
}
function opcb_e4(z)
{
     cy(z, 8) 
  qq =  set(z, (z.reg.HL >> 8), 4) ; z.reg.HL = (z.reg.HL &   0xff) | (qq << 8)
  
}
function opcb_e5(z)
{
     cy(z, 8) 
  qq =  set(z, (z.reg.HL & 0xff), 4) ; z.reg.HL = (z.reg.HL & 0xff00) | qq
  
}
function opcb_e6(z)
{
     cy(z, 15) 
  z.reg.tmp = load8(z, z.reg.HL) 
 z.reg.tmp = set(z, z.reg.tmp ,4) 
 store8(z, z.reg.HL, z.reg.tmp) 
  
}
function opcb_e7(z)
{
     cy(z, 8) 
  z.reg.A = set(z, z.reg.A, 4) 
  
}
function opcb_e8(z)
{
     cy(z, 8) 
  qq =  set(z, (z.reg.BC >> 8), 5) ; z.reg.BC = (z.reg.BC &   0xff) | (qq << 8)
  
}
function opcb_e9(z)
{
     cy(z, 8) 
  qq =  set(z, (z.reg.BC & 0xff), 5) ; z.reg.BC = (z.reg.BC & 0xff00) | qq
  
}
function opcb_ea(z)
{
     cy(z, 8) 
  qq =  set(z, (z.reg.DE >> 8), 5) ; z.reg.DE = (z.reg.DE &   0xff) | (qq << 8)
  
}
function opcb_eb(z)
{
     cy(z, 8) 
  qq =  set(z, (z.reg.DE & 0xff), 5) ; z.reg.DE = (z.reg.DE & 0xff00) | qq
  
}
function opcb_ec(z)
{
     cy(z, 8) 
  qq =  set(z, (z.reg.HL >> 8), 5) ; z.reg.HL = (z.reg.HL &   0xff) | (qq << 8)
  
}
function opcb_ed(z)
{
     cy(z, 8) 
  qq =  set(z, (z.reg.HL & 0xff), 5) ; z.reg.HL = (z.reg.HL & 0xff00) | qq
  
}
function opcb_ee(z)
{
     cy(z, 15) 
  z.reg.tmp = load8(z, z.reg.HL) 
 z.reg.tmp = set(z, z.reg.tmp ,5) 
 store8(z, z.reg.HL, z.reg.tmp) 
  
}
function opcb_ef(z)
{
     cy(z, 8) 
  z.reg.A = set(z, z.reg.A, 5) 
  
}
function opcb_f0(z)
{
     cy(z, 8) 
  qq =  set(z, (z.reg.BC >> 8), 6) ; z.reg.BC = (z.reg.BC &   0xff) | (qq << 8)
  
}
function opcb_f1(z)
{
     cy(z, 8) 
  qq =  set(z, (z.reg.BC & 0xff), 6) ; z.reg.BC = (z.reg.BC & 0xff00) | qq
  
}
function opcb_f2(z)
{
     cy(z, 8) 
  qq =  set(z, (z.reg.DE >> 8), 6) ; z.reg.DE = (z.reg.DE &   0xff) | (qq << 8)
  
}
function opcb_f3(z)
{
     cy(z, 8) 
  qq =  set(z, (z.reg.DE & 0xff), 6) ; z.reg.DE = (z.reg.DE & 0xff00) | qq
  
}
function opcb_f4(z)
{
     cy(z, 8) 
  qq =  set(z, (z.reg.HL >> 8), 6) ; z.reg.HL = (z.reg.HL &   0xff) | (qq << 8)
  
}
function opcb_f5(z)
{
     cy(z, 8) 
  qq =  set(z, (z.reg.HL & 0xff), 6) ; z.reg.HL = (z.reg.HL & 0xff00) | qq
  
}
function opcb_f6(z)
{
     cy(z, 15) 
  z.reg.tmp = load8(z, z.reg.HL) 
 z.reg.tmp = set(z, z.reg.tmp ,6) 
 store8(z, z.reg.HL, z.reg.tmp) 
  
}
function opcb_f7(z)
{
     cy(z, 8) 
  z.reg.A = set(z, z.reg.A, 6) 
  
}
function opcb_f8(z)
{
     cy(z, 8) 
  qq =  set(z, (z.reg.BC >> 8), 7) ; z.reg.BC = (z.reg.BC &   0xff) | (qq << 8)
  
}
function opcb_f9(z)
{
     cy(z, 8) 
  qq =  set(z, (z.reg.BC & 0xff), 7) ; z.reg.BC = (z.reg.BC & 0xff00) | qq
  
}
function opcb_fa(z)
{
     cy(z, 8) 
  qq =  set(z, (z.reg.DE >> 8), 7) ; z.reg.DE = (z.reg.DE &   0xff) | (qq << 8)
  
}
function opcb_fb(z)
{
     cy(z, 8) 
  qq =  set(z, (z.reg.DE & 0xff), 7) ; z.reg.DE = (z.reg.DE & 0xff00) | qq
  
}
function opcb_fc(z)
{
     cy(z, 8) 
  qq =  set(z, (z.reg.HL >> 8), 7) ; z.reg.HL = (z.reg.HL &   0xff) | (qq << 8)
  
}
function opcb_fd(z)
{
     cy(z, 8) 
  qq =  set(z, (z.reg.HL & 0xff), 7) ; z.reg.HL = (z.reg.HL & 0xff00) | qq
  
}
function opcb_fe(z)
{
     cy(z, 15) 
  z.reg.tmp = load8(z, z.reg.HL) 
 z.reg.tmp = set(z, z.reg.tmp ,7) 
 store8(z, z.reg.HL, z.reg.tmp) 
  
}
function opcb_ff(z)
{
     cy(z, 8) 
  z.reg.A = set(z, z.reg.A, 7) 
  
}
function oped_40(z)
{
     cy(z, 12) 
  qq =  zin(z, (z.reg.BC & 0xff), (z.reg.BC >> 8), 1) ; z.reg.BC = (z.reg.BC &   0xff) | (qq << 8)
  
}
function oped_41(z)
{
     cy(z, 12) 
  zout(z, (z.reg.BC & 0xff), (z.reg.BC >> 8)) 
  
}
function oped_42(z)
{
     cy(z, 15) 
  z.reg.HL =  sbc16(z, z.reg.HL, z.reg.BC) 
  
}
function oped_43(z)
{
     cy(z, 20) 
  store16(z, fetch_nn(z), z.reg.BC) 
  
}
function oped_44(z)
{
     cy(z, 8) 
  z.reg.tmp = z.reg.A 
 z.reg.A = 0 
 z.reg.A = sub(z, z.reg.A, z.reg.tmp, 0, 1) 
  
}
function oped_45(z)
{
     cy(z, 14) 
 z.reg.IFF1 = z.reg.IFF2 
 z.reg.PC =  pop(z, z.reg.PC) 
  
}
function oped_46(z)
{
     cy(z, 8) 
  z.reg.IM = 0 
  
}
function oped_47(z)
{
     cy(z, 9) 
  z.reg.I = z.reg.A 
  
}
function oped_48(z)
{
     cy(z, 12) 
  qq =  zin(z, (z.reg.BC & 0xff), (z.reg.BC & 0xff), 1) ; z.reg.BC = (z.reg.BC & 0xff00) | qq
  
}
function oped_49(z)
{
     cy(z, 12) 
  zout(z, (z.reg.BC & 0xff), (z.reg.BC & 0xff)) 
  
}
function oped_4a(z)
{
     cy(z, 15) 
  z.reg.HL =  adc16(z, z.reg.HL, z.reg.BC) 
  
}
function oped_4b(z)
{
     cy(z, 20) 
  z.reg.BC =  load16(z, fetch_nn(z)) 
  
}
function oped_4d(z)
{
     cy(z, 14) 
 z.reg.IFF1 = z.reg.IFF2 
 z.reg.PC =  pop(z, z.reg.PC) 
  
}
function oped_4f(z)
{
     cy(z, 9) 
  z.reg.R = z.reg.A 
  
}
function oped_50(z)
{
     cy(z, 12) 
  qq =  zin(z, (z.reg.BC & 0xff), (z.reg.DE >> 8), 1) ; z.reg.DE = (z.reg.DE &   0xff) | (qq << 8)
  
}
function oped_51(z)
{
     cy(z, 12) 
  zout(z, (z.reg.BC & 0xff), (z.reg.DE >> 8)) 
  
}
function oped_52(z)
{
     cy(z, 15) 
  z.reg.HL =  sbc16(z, z.reg.HL, z.reg.DE) 
  
}
function oped_53(z)
{
     cy(z, 20) 
  store16(z, fetch_nn(z), z.reg.DE) 
  
}
function oped_56(z)
{
     cy(z, 8) 
  z.reg.IM = 1 
  
}
function oped_57(z)
{
     cy(z, 9) 
  
		z.reg.A = z.reg.I 
		assign_h(z, 0) 
		assign_n(z, 0) 
		assign_s(z, z.reg.I & 0x80) 
		assign_z(z, !(z.reg.I)) 
		assign_pv(z, z.reg.IFF2) 
		 
}
function oped_58(z)
{
     cy(z, 12) 
  qq =  zin(z, (z.reg.BC & 0xff), (z.reg.DE & 0xff), 1) ; z.reg.DE = (z.reg.DE & 0xff00) | qq
  
}
function oped_59(z)
{
     cy(z, 12) 
  zout(z, (z.reg.BC & 0xff), (z.reg.DE & 0xff)) 
  
}
function oped_5a(z)
{
     cy(z, 15) 
  z.reg.HL =  adc16(z, z.reg.HL, z.reg.DE) 
  
}
function oped_5b(z)
{
     cy(z, 20) 
  z.reg.DE =  load16(z, fetch_nn(z)) 
  
}
function oped_5e(z)
{
     cy(z, 8) 
  z.reg.IM = 2 
  
}
function oped_5f(z)
{
     
		z.reg.A = z.reg.R 
		assign_h(z, 0) 
		assign_n(z, 0) 
		assign_s(z, z.reg.R & 0x80) 
		assign_z(z, !(z.reg.R)) 
		assign_pv(z, z.reg.IFF2) 
		cy(z, 9) 
		 
}
function oped_60(z)
{
     cy(z, 12) 
  qq =  zin(z, (z.reg.BC & 0xff), (z.reg.HL >> 8), 1) ; z.reg.HL = (z.reg.HL &   0xff) | (qq << 8)
  
}
function oped_61(z)
{
     cy(z, 12) 
  zout(z, (z.reg.BC & 0xff), (z.reg.HL >> 8)) 
  
}
function oped_62(z)
{
     cy(z, 15) 
  z.reg.HL =  sbc16(z, z.reg.HL, z.reg.HL) 
  
}
function oped_63(z)
{
     cy(z, 20) 
  store16(z, fetch_nn(z), z.reg.HL) 
  
}

function oped_67( z ) {
    cy(z, 18);
		z.reg.tmp = load8( z, z.reg.HL ) & 15;
		//store8( z, z.reg.HL, ( ( ( z.mem[z.reg.HL] >> 4 ) & 15 ) | ( z.reg.A << 4 ) ) );
		store8( z, z.reg.HL, ( ( ( load8( z, z.reg.HL ) >> 4 ) & 15 ) | ( z.reg.A << 4 ) ) );
		z.reg.A = (z.reg.A & 0xf0) | z.reg.tmp 
		assign_s(z, z.reg.A & 0x80) 
		assign_z(z, !(z.reg.A)) 
		assign_h(z, 0) 
		assign_pv(z, parity(z.reg.A)) 
		assign_n(z, 0) 
		 
}
function oped_68(z)
{
     cy(z, 12) 
  qq =  zin(z, (z.reg.BC & 0xff), (z.reg.HL & 0xff), 1) ; z.reg.HL = (z.reg.HL & 0xff00) | qq
  
}
function oped_69(z)
{
     cy(z, 12) 
  zout(z, (z.reg.BC & 0xff), (z.reg.HL & 0xff)) 
  
}
function oped_6a(z)
{
     cy(z, 15) 
  z.reg.HL =  adc16(z, z.reg.HL, z.reg.HL) 
  
}
function oped_6b(z)
{
     cy(z, 20) 
  z.reg.HL =  load16(z, fetch_nn(z)) 
  
}

function oped_6f(z) {
  cy(z, 18);
	z.reg.tmp = ( load8( z, z.reg.HL ) >> 4 ) & 15;
	//store8( z, z.reg.HL, ( ( z.mem[z.reg.HL] << 4 ) | ( z.reg.A & 15 ) ) );
	store8( z, z.reg.HL, ( ( load8( z, z.reg.HL ) << 4 ) | ( z.reg.A & 15 ) ) );
	z.reg.A = ( z.reg.A & 0xf0 ) | z.reg.tmp;
	assign_s( z, z.reg.A & 0x80 );
	assign_z( z, ! ( z.reg.A ) );
	assign_h( z, 0 );
	assign_pv( z, parity( z.reg.A ) );
	assign_n( z, 0 );
}
function oped_72(z)
{
     cy(z, 15) 
  z.reg.HL =  sbc16(z, z.reg.HL, z.reg.SP) 
  
}
function oped_73(z)
{
     cy(z, 20) 
  store16(z, fetch_nn(z), z.reg.SP) 
  
}
function oped_78(z)
{
     cy(z, 12) 
  z.reg.A = zin(z, (z.reg.BC & 0xff), z.reg.A, 1) 
  
}
function oped_79(z)
{
     cy(z, 12) 
  zout(z, (z.reg.BC & 0xff), z.reg.A) 
  
}
function oped_7a(z)
{
     cy(z, 15) 
  z.reg.HL =  adc16(z, z.reg.HL, z.reg.SP) 
  
}
function oped_7b(z)
{
     cy(z, 20) 
  z.reg.SP =  load16(z, fetch_nn(z)) 
  
}
function oped_a0(z)
{
     cy(z, 16) 
  
		store8(z, z.reg.DE, load8(z, z.reg.HL)) 
inc_hl(z) 
		inc_de(z) 
		dec_bc(z) 
		assign_h(z, 0) 
		assign_n(z, 0) 
		assign_pv(z, z.reg.BC) 
		 
}
function oped_a1(z)
{
     cy(z, 16) 
  
		z.reg.tmp = !!(z.reg.fC) 
		cp(z, load8(z, z.reg.HL)) 
inc_hl(z) 
		dec_bc(z) 
		assign_pv(z, z.reg.BC) 
		assign_c(z, z.reg.tmp) 
		 
}
function oped_a2(z)
{
     cy(z, 16) 
  
		z.reg.tmp = zin(z, (z.reg.BC & 0xff), z.reg.tmp ,0) 
		store8(z, z.reg.HL, z.reg.tmp) 
		inc_hl(z) 
		dec_b(z) 
		assign_z(z, !((z.reg.BC >> 8))) 
		assign_n(z, 1) 
		 
}
function oped_a3(z)
{
     cy(z, 16) 
  
		zout(z, (z.reg.BC & 0xff), load8(z, z.reg.HL)) 
inc_hl(z) 
		dec_b(z) 
		assign_z(z, !((z.reg.BC >> 8))) 
		assign_n(z, 1) 
		 
}
function oped_a8(z)
{
     cy(z, 16) 
  
		store8(z, z.reg.DE, load8(z, z.reg.HL)) 
dec_hl(z) 
		dec_de(z) 
		dec_bc(z) 
		assign_h(z, 0) 
		assign_n(z, 0) 
		assign_pv(z, z.reg.BC) 
		 
}
function oped_a9(z)
{
	 cy(z, 16) 
  
		z.reg.tmp = !!(z.reg.fC) 
		cp(z, load8(z, z.reg.HL)) 
dec_hl(z) 
		dec_bc(z) 
		assign_pv(z, z.reg.BC) 
		assign_c(z, z.reg.tmp) 
		 
}
function oped_aa(z)
{
	 cy(z, 16) 
  
		z.reg.tmp = zin(z, (z.reg.BC & 0xff), z.reg.tmp ,0) 
		store8(z, z.reg.HL, z.reg.tmp) 
		dec_hl(z) 
		dec_b(z) 
		assign_z(z, !((z.reg.BC >> 8))) 
		assign_n(z, 1) 
		 
}
function oped_ab(z)
{
     cy(z, 16) 
  
		zout(z, (z.reg.BC & 0xff), load8(z, z.reg.HL)) 
dec_hl(z) 
		dec_b(z) 
		assign_z(z, !((z.reg.BC >> 8))) 
		assign_n(z, 1) 
		 
}

function oped_b0(z) {
  //console.log( 'op ed b0' );
	store8( z, z.reg.DE, load8( z, z.reg.HL ) );
  inc_hl( z );
  inc_de( z );
	dec_bc( z );
	assign_h( z, 0 );
	assign_n( z, 0 );
	assign_pv( z, z.reg.BC );
	if ( z.reg.BC == 0 ) { cy( z,  16 );
    return;
  }
	cy(z, 21);
	z.reg.PC = z.reg.PC - 2;
}

function oped_b1(z)
{
      
		z.reg.tmp = !!(z.reg.fC) 
		cp(z, load8(z, z.reg.HL)) 
inc_hl(z) 
		dec_bc(z) 
		assign_pv(z, z.reg.BC) 
		assign_c(z, z.reg.tmp) 
		if ( z.reg.BC == 0 || z.reg.fZ ) { cy(z,  16 ) 
 return 
 } 
		cy(z, 21) 
		z.reg.PC = z.reg.PC - 2 
		 
}
function oped_b2(z)
{
      
		z.reg.tmp = zin(z, (z.reg.BC & 0xff), z.reg.tmp ,0) 
		store8(z, z.reg.HL, z.reg.tmp) 
		inc_hl(z) 
		dec_b(z) 
		assign_z(z, !((z.reg.BC >> 8))) 
		assign_n(z, 1) 
		if (!!((z.reg.BC >> 8))) { z.reg.PC = z.reg.PC - 2 
 cy(z, 21) 
 } 
		else { cy(z, 16) 
 } 
		 
}
function oped_b3(z)
{
      
		zout(z, (z.reg.BC & 0xff), load8(z, z.reg.HL)) 
inc_hl(z) 
		dec_b(z) 
		assign_z(z, !((z.reg.BC >> 8))) 
		assign_n(z, 1) 
		if (!!((z.reg.BC >> 8))) { z.reg.PC = z.reg.PC - 2 
 cy(z, 21) 
 } 
		else { cy(z, 16) 
 } 
		 
}
function oped_b8(z)
{
    	 
		store8(z, z.reg.DE, load8(z, z.reg.HL)) 
dec_hl(z) 
		dec_de(z) 
		dec_bc(z) 
		assign_h(z, 0) 
		assign_n(z, 0) 
		assign_pv(z, z.reg.BC) 
		if ( z.reg.BC == 0 ) { cy(z,  16 ) 
 return 
 } 
		cy(z, 21) 
		z.reg.PC = z.reg.PC - 2 
		 
}
function oped_b9(z)
{
      
		z.reg.tmp = !!(z.reg.fC) 
		cp(z, load8(z, z.reg.HL)) 
dec_hl(z) 
		dec_bc(z) 
		assign_pv(z, z.reg.BC) 
		assign_c(z, z.reg.tmp) 
		if ( z.reg.BC == 0 || z.reg.fZ ) { cy(z,  16 ) 
 return 
 } 
		z.reg.PC = z.reg.PC - 2 
		 
}
function oped_ba(z)
{
      
		z.reg.tmp = zin(z, (z.reg.BC & 0xff), z.reg.tmp ,0) 
		store8(z, z.reg.HL, z.reg.tmp) 
		dec_hl(z) 
		dec_b(z) 
		assign_z(z, !((z.reg.BC >> 8))) 
		assign_n(z, 1) 
		if (!!((z.reg.BC >> 8))) { z.reg.PC = z.reg.PC - 2 
 cy(z, 21) 
 } 
		else { cy(z, 16) 
 } 
		 
}
function oped_bb(z)
{
      
		zout(z, (z.reg.BC & 0xff), load8(z, z.reg.HL)) 
dec_hl(z) 
		dec_b(z) 
		assign_z(z, !((z.reg.BC >> 8))) 
		assign_n(z, 1) 
		if (!!((z.reg.BC >> 8))) { z.reg.PC = z.reg.PC - 2 
 cy(z, 21) 
 } 
		else { cy(z, 16) 
 } 
		 
}
function oped_default(z)
{
      
}
function opx_09(z)
{
     cy(z, 15) 
  z.reg.IQ =  add16(z, z.reg.IQ, z.reg.BC) 
  
}
function opx_19(z)
{
     cy(z, 15) 
  z.reg.IQ =  add16(z, z.reg.IQ, z.reg.DE) 
  
}
function opx_21(z)
{
     cy(z, 14) 
  z.reg.IQ =  fetch_nn(z) 
  
}
function opx_22(z)
{
     cy(z, 20) 
  store16(z, fetch_nn(z), z.reg.IQ) 
  
}
function opx_23(z)
{
     cy(z, 10) 
  inc_xy(z) 
  
}
function opx_24(z)
{
	 cy(z, 8) 
  qq =  incp(z, (z.reg.IQ >> 8)) ; z.reg.IQ = (z.reg.IQ &   0xff) | (qq << 8)
  
}
function opx_25(z)
{
	 cy(z, 8) 
  qq =  decp(z, (z.reg.IQ >> 8)) ; z.reg.IQ = (z.reg.IQ &   0xff) | (qq << 8)
  
}
function opx_26(z)
{
	 cy(z, 11) 
 qq =  fetch_n(z) ; z.reg.IQ = (z.reg.IQ &   0xff) | (qq << 8)
  
}
function opx_29(z)
{
     cy(z, 15) 
  z.reg.IQ =  add16(z, z.reg.IQ, z.reg.IQ) 
  
}
function opx_2a(z)
{
     cy(z, 20) 
  z.reg.IQ =  load16(z, fetch_nn(z)) 
  
}
function opx_2b(z)
{
     cy(z, 10) 
  dec_xy(z) 
  
}
function opx_2c(z)
{
	 cy(z, 8) 
  qq =  incp(z, (z.reg.IQ & 0xff)) ; z.reg.IQ = (z.reg.IQ & 0xff00) | qq
  
}
function opx_2d(z)
{
	 cy(z, 8) 
  qq =  decp(z, (z.reg.IQ & 0xff)) ; z.reg.IQ = (z.reg.IQ & 0xff00) | qq
  
}
function opx_2e(z)
{
	 cy(z, 11) 
 qq =  fetch_n(z) ; z.reg.IQ = (z.reg.IQ & 0xff00) | qq
  
}
function opx_34(z)
{
     cy(z, 23) 
  z.reg.tmp = load8(z, ixy_d = ixy(z)) 
 z.reg.tmp = incp(z, z.reg.tmp) 
 store8(z, ixy_d, z.reg.tmp) 
  
}
function opx_35(z)
{
     cy(z, 23) 
  z.reg.tmp = load8(z, ixy_d = ixy(z)) 
 z.reg.tmp = decp(z, z.reg.tmp) 
 store8(z, ixy_d, z.reg.tmp) 
  
}
function opx_36(z)
{
     cy(z, 19) 
  ixy_d = ixy(z) 
  
 store8(z, ixy_d, fetch_n(z)) 
  
}
function opx_39(z)
{
     cy(z, 15) 
  z.reg.IQ =  add16(z, z.reg.IQ, z.reg.SP) 
  
}
function opx_44(z)
{
	 cy(z, 8) 
  qq =  (z.reg.IQ >> 8) ; z.reg.BC = (z.reg.BC &   0xff) | (qq << 8)
  
}
function opx_45(z)
{
	 cy(z, 8) 
  qq =  (z.reg.IQ & 0xff) ; z.reg.BC = (z.reg.BC &   0xff) | (qq << 8)
  
}
function opx_46(z)
{
     cy(z, 19) 
  qq =  load8(z, ixy(z)) ; z.reg.BC = (z.reg.BC &   0xff) | (qq << 8)
  
}
function opx_4c(z)
{
	 cy(z, 8) 
  qq =  (z.reg.IQ >> 8) ; z.reg.BC = (z.reg.BC & 0xff00) | qq
  
}
function opx_4d(z)
{
	 cy(z, 8) 
  qq =  (z.reg.IQ & 0xff) ; z.reg.BC = (z.reg.BC & 0xff00) | qq
  
}
function opx_4e(z)
{
     cy(z, 19) 
  qq =  load8(z, ixy(z)) ; z.reg.BC = (z.reg.BC & 0xff00) | qq
  
}
function opx_54(z)
{
	 cy(z, 8) 
  qq =  (z.reg.IQ >> 8) ; z.reg.DE = (z.reg.DE &   0xff) | (qq << 8)
  
}
function opx_55(z)
{
	 cy(z, 8) 
  qq =  (z.reg.IQ & 0xff) ; z.reg.DE = (z.reg.DE &   0xff) | (qq << 8)
  
}
function opx_56(z)
{
     cy(z, 19) 
  qq =  load8(z, ixy(z)) ; z.reg.DE = (z.reg.DE &   0xff) | (qq << 8)
  
}
function opx_5c(z)
{
	 cy(z, 8) 
  qq =  (z.reg.IQ >> 8) ; z.reg.DE = (z.reg.DE & 0xff00) | qq
  
}
function opx_5d(z)
{
	 cy(z, 8) 
  qq =  (z.reg.IQ & 0xff) ; z.reg.DE = (z.reg.DE & 0xff00) | qq
  
}
function opx_5e(z)
{
     cy(z, 19) 
  qq =  load8(z, ixy(z)) ; z.reg.DE = (z.reg.DE & 0xff00) | qq
  
}
function opx_60(z)
{
	 cy(z, 8) 
  qq =  (z.reg.BC >> 8) ; z.reg.IQ = (z.reg.IQ &   0xff) | (qq << 8)
  
}
function opx_61(z)
{
	 cy(z, 8) 
  qq =  (z.reg.BC & 0xff) ; z.reg.IQ = (z.reg.IQ &   0xff) | (qq << 8)
  
}
function opx_62(z)
{
	 cy(z, 8) 
  qq =  (z.reg.DE >> 8) ; z.reg.IQ = (z.reg.IQ &   0xff) | (qq << 8)
  
}
function opx_63(z)
{
	 cy(z, 8) 
  qq =  (z.reg.DE & 0xff) ; z.reg.IQ = (z.reg.IQ &   0xff) | (qq << 8)
  
}
function opx_64(z)
{
	 cy(z, 8) 
   
}
function opx_65(z)
{
	 cy(z, 8) 
  qq =  (z.reg.IQ & 0xff) ; z.reg.IQ = (z.reg.IQ &   0xff) | (qq << 8)
  
}
function opx_66(z)
{
     cy(z, 19) 
  qq =  load8(z, ixy(z)) ; z.reg.HL = (z.reg.HL &   0xff) | (qq << 8)
  
}
function opx_67(z)
{
	 cy(z, 8) 
  qq =  z.reg.A ; z.reg.IQ = (z.reg.IQ &   0xff) | (qq << 8)
  
}
function opx_68(z)
{
	 cy(z, 8) 
  qq =  (z.reg.BC >> 8) ; z.reg.IQ = (z.reg.IQ & 0xff00) | qq
  
}
function opx_69(z)
{
	 cy(z, 8) 
  qq =  (z.reg.BC & 0xff) ; z.reg.IQ = (z.reg.IQ & 0xff00) | qq
  
}
function opx_6a(z)
{
	 cy(z, 8) 
  qq =  (z.reg.DE >> 8) ; z.reg.IQ = (z.reg.IQ & 0xff00) | qq
  
}
function opx_6b(z)
{
	 cy(z, 8) 
  qq =  (z.reg.DE & 0xff) ; z.reg.IQ = (z.reg.IQ & 0xff00) | qq
  
}
function opx_6c(z)
{
	 cy(z, 8) 
  qq =  (z.reg.IQ >> 8) ; z.reg.IQ = (z.reg.IQ & 0xff00) | qq
  
}
function opx_6d(z)
{
	 cy(z, 8) 
   
}
function opx_6e(z)
{
     cy(z, 19) 
  qq =  load8(z, ixy(z)) ; z.reg.HL = (z.reg.HL & 0xff00) | qq
  
}
function opx_6f(z)
{
	 cy(z, 8) 
  qq =  z.reg.A ; z.reg.IQ = (z.reg.IQ & 0xff00) | qq
  
}
function opx_70(z)
{
     cy(z, 19) 
  store8(z, ixy(z), (z.reg.BC >> 8)) 
  
}
function opx_71(z)
{
     cy(z, 19) 
  store8(z, ixy(z), (z.reg.BC & 0xff)) 
  
}
function opx_72(z)
{
     cy(z, 19) 
  store8(z, ixy(z), (z.reg.DE >> 8)) 
  
}
function opx_73(z)
{
     cy(z, 19) 
  store8(z, ixy(z), (z.reg.DE & 0xff)) 
  
}
function opx_74(z)
{
     cy(z, 19) 
  store8(z, ixy(z), (z.reg.HL >> 8)) 
  
}
function opx_75(z)
{
     cy(z, 19) 
  store8(z, ixy(z), (z.reg.HL & 0xff)) 
  
}
function opx_77(z)
{
     cy(z, 19) 
  store8(z, ixy(z), z.reg.A) 
  
}
function opx_7c(z)
{
	 cy(z, 8) 
  z.reg.A = (z.reg.IQ >> 8) 
  
}
function opx_7d(z)
{
	 cy(z, 8) 
  z.reg.A = (z.reg.IQ & 0xff) 
  
}
function opx_7e(z)
{
     cy(z, 19) 
  z.reg.A = load8(z, ixy(z)) 
  
}
function opx_84(z)
{
	 cy(z, 8) 
  z.reg.A = add(z, z.reg.A, (z.reg.IQ >> 8), 0, 1) 
  
}
function opx_85(z)
{
	 cy(z, 8) 
  z.reg.A = add(z, z.reg.A, (z.reg.IQ & 0xff), 0, 1) 
  
}
function opx_86(z)
{
     cy(z, 19) 
  z.reg.A = add(z, z.reg.A, load8(z, ixy(z)), 0, 1) 
  
}
function opx_8c(z)
{
	 cy(z, 8) 
  z.reg.A = add(z, z.reg.A, (z.reg.IQ >> 8), !!(z.reg.fC), 1) 
  
}
function opx_8d(z)
{
	 cy(z, 8) 
  z.reg.A = add(z, z.reg.A, (z.reg.IQ & 0xff), !!(z.reg.fC), 1) 
  
}
function opx_8e(z)
{
     cy(z, 19) 
  z.reg.A = add(z, z.reg.A, load8(z, ixy(z)), !!(z.reg.fC), 1) 
  
}
function opx_94(z)
{
	 cy(z, 8) 
  z.reg.A = sub(z, z.reg.A, (z.reg.IQ >> 8), 0, 1) 
  
}
function opx_95(z)
{
	 cy(z, 8) 
  z.reg.A = sub(z, z.reg.A, (z.reg.IQ & 0xff), 0, 1) 
  
}
function opx_96(z)
{
     cy(z, 19) 
  z.reg.A = sub(z, z.reg.A, load8(z, ixy(z)), 0, 1) 
  
}
function opx_9c(z)
{
	 cy(z, 8) 
  z.reg.A = sub(z, z.reg.A, (z.reg.IQ >> 8), !!(z.reg.fC), 1) 
  
}
function opx_9d(z)
{
	 cy(z, 8) 
  z.reg.A = sub(z, z.reg.A, (z.reg.IQ & 0xff), !!(z.reg.fC), 1) 
  
}
function opx_9e(z)
{
     cy(z, 19) 
  z.reg.A = sub(z, z.reg.A, load8(z, ixy(z)), !!(z.reg.fC), 1) 
  
}
function opx_a4(z)
{
	 cy(z, 8) 
  and(z, (z.reg.IQ >> 8)) 
  
}
function opx_a5(z)
{
	 cy(z, 8) 
  and(z, (z.reg.IQ & 0xff)) 
  
}
function opx_a6(z)
{
     cy(z, 19) 
  and(z, load8(z, ixy(z))) 
  
}
function opx_ac(z)
{
	 cy(z, 8) 
  xor(z, (z.reg.IQ >> 8)) 
  
}
function opx_ad(z)
{
	 cy(z, 8) 
  xor(z, (z.reg.IQ & 0xff)) 
  
}
function opx_ae(z)
{
     cy(z, 19) 
  xor(z, load8(z, ixy(z))) 
  
}
function opx_b4(z)
{
	 cy(z, 8) 
  or(z, (z.reg.IQ >> 8)) 
  
}
function opx_b5(z)
{
	 cy(z, 8) 
  or(z, (z.reg.IQ & 0xff)) 
  
}
function opx_b6(z)
{
     cy(z, 19) 
  or(z, load8(z, ixy(z))) 
  
}
function opx_bc(z)
{
	 cy(z, 8) 
  cp(z, (z.reg.IQ >> 8)) 
  
}
function opx_bd(z)
{
	 cy(z, 8) 
  cp(z, (z.reg.IQ & 0xff)) 
  
}
function opx_be(z)
{
     cy(z, 19) 
  cp(z, load8(z, ixy(z))) 
  
}
function opx_default(z)
{
      
}
function opx_e1(z)
{
     cy(z, 14) 
  z.reg.IQ =  pop(z, z.reg.IQ) 
  
}
function opx_e3(z)
{
     cy(z, 23) 
  z.reg.IQ =  ex_memsp(z, z.reg.IQ) 
  
}
function opx_e5(z)
{
     cy(z, 15) 
  push(z, z.reg.IQ) 
  
}
function opx_e9(z)
{
     cy(z, 8) 
  z.reg.PC =  z.reg.IQ 
  
}
function opx_f9(z)
{
     cy(z, 10) 
  z.reg.SP =  z.reg.IQ 
  
}
function opxcb_06(z,ixy_d)
{
	 cy(z, 23) 
  z.reg.tmp = rlc(z, z.reg.tmp) 
 store8(z, ixy_d, z.reg.tmp) 
  
}
function opxcb_0e(z,ixy_d)
{
	 cy(z, 23) 
  z.reg.tmp = rrc(z, z.reg.tmp) 
 store8(z, ixy_d, z.reg.tmp) 
  
}
function opxcb_16(z,ixy_d)
{
	 cy(z, 23) 
  z.reg.tmp = rl(z, z.reg.tmp) 
 store8(z, ixy_d, z.reg.tmp) 
  
}
function opxcb_1e(z,ixy_d)
{
	 cy(z, 23) 
  z.reg.tmp = rr(z, z.reg.tmp) 
 store8(z, ixy_d, z.reg.tmp) 
  
}
function opxcb_26(z,ixy_d)
{
	 cy(z, 23) 
  z.reg.tmp = sla(z, z.reg.tmp) 
 store8(z, ixy_d, z.reg.tmp) 
  
}
function opxcb_2e(z,ixy_d)
{
	 cy(z, 23) 
  z.reg.tmp = sra(z, z.reg.tmp) 
 store8(z, ixy_d, z.reg.tmp) 
  
}
function opxcb_36(z,ixy_d)
{
     cy(z, 23) 
  z.reg.tmp = sl1(z, z.reg.tmp) 
 store8(z, ixy_d, z.reg.tmp) 
  
}
function opxcb_3e(z,ixy_d)
{
	 cy(z, 23) 
  z.reg.tmp = srl(z, z.reg.tmp) 
 store8(z, ixy_d, z.reg.tmp) 
  
}
function opxcb_46(z,ixy_d)
{
	 cy(z, 20) 
  bit(z, z.reg.tmp, 0) 
  
}
function opxcb_4e(z,ixy_d)
{
	 cy(z, 20) 
  bit(z, z.reg.tmp, 1) 
  
}
function opxcb_56(z,ixy_d)
{
	 cy(z, 20) 
  bit(z, z.reg.tmp, 2) 
  
}
function opxcb_5e(z,ixy_d)
{
	 cy(z, 20) 
  bit(z, z.reg.tmp, 3) 
  
}
function opxcb_66(z,ixy_d)
{
	 cy(z, 20) 
  bit(z, z.reg.tmp, 4) 
  
}
function opxcb_6e(z,ixy_d)
{
	 cy(z, 20) 
  bit(z, z.reg.tmp, 5) 
  
}
function opxcb_76(z,ixy_d)
{
	 cy(z, 20) 
  bit(z, z.reg.tmp, 6) 
  
}
function opxcb_7e(z,ixy_d)
{
	 cy(z, 20) 
  bit(z, z.reg.tmp, 7) 
  
}
function opxcb_86(z,ixy_d)
{
	 cy(z, 23) 
  z.reg.tmp = res(z, z.reg.tmp ,0) 
 store8(z, ixy_d, z.reg.tmp) 
  
}
function opxcb_8e(z,ixy_d)
{
	 cy(z, 23) 
  z.reg.tmp = res(z, z.reg.tmp ,1) 
 store8(z, ixy_d, z.reg.tmp) 
  
}
function opxcb_96(z,ixy_d)
{
	 cy(z, 23) 
  z.reg.tmp = res(z, z.reg.tmp ,2) 
 store8(z, ixy_d, z.reg.tmp) 
  
}
function opxcb_9e(z,ixy_d)
{
	 cy(z, 23) 
  z.reg.tmp = res(z, z.reg.tmp ,3) 
 store8(z, ixy_d, z.reg.tmp) 
  
}
function opxcb_a6(z,ixy_d)
{
	 cy(z, 23) 
  z.reg.tmp = res(z, z.reg.tmp ,4) 
 store8(z, ixy_d, z.reg.tmp) 
  
}
function opxcb_ae(z,ixy_d)
{
	 cy(z, 23) 
  z.reg.tmp = res(z, z.reg.tmp ,5) 
 store8(z, ixy_d, z.reg.tmp) 
  
}
function opxcb_b6(z,ixy_d)
{
	 cy(z, 23) 
  z.reg.tmp = res(z, z.reg.tmp ,6) 
 store8(z, ixy_d, z.reg.tmp) 
  
}
function opxcb_be(z,ixy_d)
{
	 cy(z, 23) 
  z.reg.tmp = res(z, z.reg.tmp ,7) 
 store8(z, ixy_d, z.reg.tmp) 
  
}
function opxcb_c6(z,ixy_d)
{
	 cy(z, 23) 
  z.reg.tmp = set(z, z.reg.tmp ,0) 
 store8(z, ixy_d, z.reg.tmp) 
  
}
function opxcb_ce(z,ixy_d)
{
	 cy(z, 23) 
  z.reg.tmp = set(z, z.reg.tmp ,1) 
 store8(z, ixy_d, z.reg.tmp) 
  
}
function opxcb_d6(z,ixy_d)
{
	 cy(z, 23) 
  z.reg.tmp = set(z, z.reg.tmp ,2) 
 store8(z, ixy_d, z.reg.tmp) 
  
}
function opxcb_de(z,ixy_d)
{
	 cy(z, 23) 
  z.reg.tmp = set(z, z.reg.tmp ,3) 
 store8(z, ixy_d, z.reg.tmp) 
  
}
function opxcb_default(z,ixy_d)
{
	  
}
function opxcb_e6(z,ixy_d)
{
	 cy(z, 23) 
  z.reg.tmp = set(z, z.reg.tmp ,4) 
 store8(z, ixy_d, z.reg.tmp) 
  
}
function opxcb_ee(z,ixy_d)
{
	 cy(z, 23) 
  z.reg.tmp = set(z, z.reg.tmp ,5) 
 store8(z, ixy_d, z.reg.tmp) 
  
}
function opxcb_f6(z,ixy_d)
{
	 cy(z, 23) 
  z.reg.tmp = set(z, z.reg.tmp ,6) 
 store8(z, ixy_d, z.reg.tmp) 
  
}
function opxcb_fe(z,ixy_d)
{
	 cy(z, 23) 
  z.reg.tmp = set(z, z.reg.tmp ,7) 
 store8(z, ixy_d, z.reg.tmp) 
  
}
function build_op()
{
    op = [];
    op[0x00] = op_00;
    op[0x01] = op_01;
    op[0x02] = op_02;
    op[0x03] = op_03;
    op[0x04] = op_04;
    op[0x05] = op_05;
    op[0x06] = op_06;
    op[0x07] = op_07;
    op[0x08] = op_08;
    op[0x09] = op_09;
    op[0x0a] = op_0a;
    op[0x0b] = op_0b;
    op[0x0c] = op_0c;
    op[0x0d] = op_0d;
    op[0x0e] = op_0e;
    op[0x0f] = op_0f;
    op[0x10] = op_10;
    op[0x11] = op_11;
    op[0x12] = op_12;
    op[0x13] = op_13;
    op[0x14] = op_14;
    op[0x15] = op_15;
    op[0x16] = op_16;
    op[0x17] = op_17;
    op[0x18] = op_18;
    op[0x19] = op_19;
    op[0x1a] = op_1a;
    op[0x1b] = op_1b;
    op[0x1c] = op_1c;
    op[0x1d] = op_1d;
    op[0x1e] = op_1e;
    op[0x1f] = op_1f;
    op[0x20] = op_20;
    op[0x21] = op_21;
    op[0x22] = op_22;
    op[0x23] = op_23;
    op[0x24] = op_24;
    op[0x25] = op_25;
    op[0x26] = op_26;
    op[0x27] = op_27;
    op[0x28] = op_28;
    op[0x29] = op_29;
    op[0x2a] = op_2a;
    op[0x2b] = op_2b;
    op[0x2c] = op_2c;
    op[0x2d] = op_2d;
    op[0x2e] = op_2e;
    op[0x2f] = op_2f;
    op[0x30] = op_30;
    op[0x31] = op_31;
    op[0x32] = op_32;
    op[0x33] = op_33;
    op[0x34] = op_34;
    op[0x35] = op_35;
    op[0x36] = op_36;
    op[0x37] = op_37;
    op[0x38] = op_38;
    op[0x39] = op_39;
    op[0x3a] = op_3a;
    op[0x3b] = op_3b;
    op[0x3c] = op_3c;
    op[0x3d] = op_3d;
    op[0x3e] = op_3e;
    op[0x3f] = op_3f;
    op[0x40] = op_40;
    op[0x41] = op_41;
    op[0x42] = op_42;
    op[0x43] = op_43;
    op[0x44] = op_44;
    op[0x45] = op_45;
    op[0x46] = op_46;
    op[0x47] = op_47;
    op[0x48] = op_48;
    op[0x49] = op_49;
    op[0x4a] = op_4a;
    op[0x4b] = op_4b;
    op[0x4c] = op_4c;
    op[0x4d] = op_4d;
    op[0x4e] = op_4e;
    op[0x4f] = op_4f;
    op[0x50] = op_50;
    op[0x51] = op_51;
    op[0x52] = op_52;
    op[0x53] = op_53;
    op[0x54] = op_54;
    op[0x55] = op_55;
    op[0x56] = op_56;
    op[0x57] = op_57;
    op[0x58] = op_58;
    op[0x59] = op_59;
    op[0x5a] = op_5a;
    op[0x5b] = op_5b;
    op[0x5c] = op_5c;
    op[0x5d] = op_5d;
    op[0x5e] = op_5e;
    op[0x5f] = op_5f;
    op[0x60] = op_60;
    op[0x61] = op_61;
    op[0x62] = op_62;
    op[0x63] = op_63;
    op[0x64] = op_64;
    op[0x65] = op_65;
    op[0x66] = op_66;
    op[0x67] = op_67;
    op[0x68] = op_68;
    op[0x69] = op_69;
    op[0x6a] = op_6a;
    op[0x6b] = op_6b;
    op[0x6c] = op_6c;
    op[0x6d] = op_6d;
    op[0x6e] = op_6e;
    op[0x6f] = op_6f;
    op[0x70] = op_70;
    op[0x71] = op_71;
    op[0x72] = op_72;
    op[0x73] = op_73;
    op[0x74] = op_74;
    op[0x75] = op_75;
    op[0x76] = op_76;
    op[0x77] = op_77;
    op[0x78] = op_78;
    op[0x79] = op_79;
    op[0x7a] = op_7a;
    op[0x7b] = op_7b;
    op[0x7c] = op_7c;
    op[0x7d] = op_7d;
    op[0x7e] = op_7e;
    op[0x7f] = op_7f;
    op[0x80] = op_80;
    op[0x81] = op_81;
    op[0x82] = op_82;
    op[0x83] = op_83;
    op[0x84] = op_84;
    op[0x85] = op_85;
    op[0x86] = op_86;
    op[0x87] = op_87;
    op[0x88] = op_88;
    op[0x89] = op_89;
    op[0x8a] = op_8a;
    op[0x8b] = op_8b;
    op[0x8c] = op_8c;
    op[0x8d] = op_8d;
    op[0x8e] = op_8e;
    op[0x8f] = op_8f;
    op[0x90] = op_90;
    op[0x91] = op_91;
    op[0x92] = op_92;
    op[0x93] = op_93;
    op[0x94] = op_94;
    op[0x95] = op_95;
    op[0x96] = op_96;
    op[0x97] = op_97;
    op[0x98] = op_98;
    op[0x99] = op_99;
    op[0x9a] = op_9a;
    op[0x9b] = op_9b;
    op[0x9c] = op_9c;
    op[0x9d] = op_9d;
    op[0x9e] = op_9e;
    op[0x9f] = op_9f;
    op[0xa0] = op_a0;
    op[0xa1] = op_a1;
    op[0xa2] = op_a2;
    op[0xa3] = op_a3;
    op[0xa4] = op_a4;
    op[0xa5] = op_a5;
    op[0xa6] = op_a6;
    op[0xa7] = op_a7;
    op[0xa8] = op_a8;
    op[0xa9] = op_a9;
    op[0xaa] = op_aa;
    op[0xab] = op_ab;
    op[0xac] = op_ac;
    op[0xad] = op_ad;
    op[0xae] = op_ae;
    op[0xaf] = op_af;
    op[0xb0] = op_b0;
    op[0xb1] = op_b1;
    op[0xb2] = op_b2;
    op[0xb3] = op_b3;
    op[0xb4] = op_b4;
    op[0xb5] = op_b5;
    op[0xb6] = op_b6;
    op[0xb7] = op_b7;
    op[0xb8] = op_b8;
    op[0xb9] = op_b9;
    op[0xba] = op_ba;
    op[0xbb] = op_bb;
    op[0xbc] = op_bc;
    op[0xbd] = op_bd;
    op[0xbe] = op_be;
    op[0xbf] = op_bf;
    op[0xc0] = op_c0;
    op[0xc1] = op_c1;
    op[0xc2] = op_c2;
    op[0xc3] = op_c3;
    op[0xc4] = op_c4;
    op[0xc5] = op_c5;
    op[0xc6] = op_c6;
    op[0xc7] = op_c7;
    op[0xc8] = op_c8;
    op[0xc9] = op_c9;
    op[0xca] = op_ca;
    op[0xcb] = function(z) { return opcb[fetch_opcode(z)](z); }
    op[0xcc] = op_cc;
    op[0xcd] = op_cd;
    op[0xce] = op_ce;
    op[0xcf] = op_cf;
    op[0xd0] = op_d0;
    op[0xd1] = op_d1;
    op[0xd2] = op_d2;
    op[0xd3] = op_d3;
    op[0xd4] = op_d4;
    op[0xd5] = op_d5;
    op[0xd6] = op_d6;
    op[0xd7] = op_d7;
    op[0xd8] = op_d8;
    op[0xd9] = op_d9;
    op[0xda] = op_da;
    op[0xdb] = op_db;
    op[0xdc] = op_dc;
    op[0xdd] = function(z) { z.reg.IQ = z.reg.IX; opx[fetch_opcode(z)](z); z.reg.IX = z.reg.IQ; }
    op[0xde] = op_de;
    op[0xdf] = op_df;
    op[0xe0] = op_e0;
    op[0xe1] = op_e1;
    op[0xe2] = op_e2;
    op[0xe3] = op_e3;
    op[0xe4] = op_e4;
    op[0xe5] = op_e5;
    op[0xe6] = op_e6;
    op[0xe7] = op_e7;
    op[0xe8] = op_e8;
    op[0xe9] = op_e9;
    op[0xea] = op_ea;
    op[0xeb] = op_eb;
    op[0xec] = op_ec;
    op[0xed] = function(z) { return oped[fetch_opcode(z)](z); }
    op[0xee] = op_ee;
    op[0xef] = op_ef;
    op[0xf0] = op_f0;
    op[0xf1] = op_f1;
    op[0xf2] = op_f2;
    op[0xf3] = op_f3;
    op[0xf4] = op_f4;
    op[0xf5] = op_f5;
    op[0xf6] = op_f6;
    op[0xf7] = op_f7;
    op[0xf8] = op_f8;
    op[0xf9] = op_f9;
    op[0xfa] = op_fa;
    op[0xfb] = op_fb;
    op[0xfc] = op_fc;
    op[0xfd] = function(z) { z.reg.IQ = z.reg.IY; opx[fetch_opcode(z)](z); z.reg.IY = z.reg.IQ; }
    op[0xfe] = op_fe;
    op[0xff] = op_ff;
}
function build_oped()
{
    oped = [];
    var i;
    for (i = 0; i < 256; i++) oped[i] = oped_default
    oped[0x40] = oped_40;
    oped[0x41] = oped_41;
    oped[0x42] = oped_42;
    oped[0x43] = oped_43;
    oped[0x44] = oped_44;
    oped[0x45] = oped_45;
    oped[0x46] = oped_46;
    oped[0x47] = oped_47;
    oped[0x48] = oped_48;
    oped[0x49] = oped_49;
    oped[0x4a] = oped_4a;
    oped[0x4b] = oped_4b;
    oped[0x4d] = oped_4d;
    oped[0x4f] = oped_4f;
    oped[0x50] = oped_50;
    oped[0x51] = oped_51;
    oped[0x52] = oped_52;
    oped[0x53] = oped_53;
    oped[0x56] = oped_56;
    oped[0x57] = oped_57;
    oped[0x58] = oped_58;
    oped[0x59] = oped_59;
    oped[0x5a] = oped_5a;
    oped[0x5b] = oped_5b;
    oped[0x5e] = oped_5e;
    oped[0x5f] = oped_5f;
    oped[0x60] = oped_60;
    oped[0x61] = oped_61;
    oped[0x62] = oped_62;
    oped[0x63] = oped_63;
    oped[0x67] = oped_67;
    oped[0x68] = oped_68;
    oped[0x69] = oped_69;
    oped[0x6a] = oped_6a;
    oped[0x6b] = oped_6b;
    oped[0x6f] = oped_6f;
    oped[0x72] = oped_72;
    oped[0x73] = oped_73;
    oped[0x78] = oped_78;
    oped[0x79] = oped_79;
    oped[0x7a] = oped_7a;
    oped[0x7b] = oped_7b;
    oped[0xa0] = oped_a0;
    oped[0xa1] = oped_a1;
    oped[0xa2] = oped_a2;
    oped[0xa3] = oped_a3;
    oped[0xa8] = oped_a8;
    oped[0xa9] = oped_a9;
    oped[0xaa] = oped_aa;
    oped[0xab] = oped_ab;
    oped[0xb0] = oped_b0;
    oped[0xb1] = oped_b1;
    oped[0xb2] = oped_b2;
    oped[0xb3] = oped_b3;
    oped[0xb8] = oped_b8;
    oped[0xb9] = oped_b9;
    oped[0xba] = oped_ba;
    oped[0xbb] = oped_bb;
}
function build_opcb()
{
    opcb = [];
    var i;
    for (i = 0; i < 256; i++) opcb[i] = opcb_default
    opcb[0x00] = opcb_00;
    opcb[0x01] = opcb_01;
    opcb[0x02] = opcb_02;
    opcb[0x03] = opcb_03;
    opcb[0x04] = opcb_04;
    opcb[0x05] = opcb_05;
    opcb[0x06] = opcb_06;
    opcb[0x07] = opcb_07;
    opcb[0x08] = opcb_08;
    opcb[0x09] = opcb_09;
    opcb[0x0a] = opcb_0a;
    opcb[0x0b] = opcb_0b;
    opcb[0x0c] = opcb_0c;
    opcb[0x0d] = opcb_0d;
    opcb[0x0e] = opcb_0e;
    opcb[0x0f] = opcb_0f;
    opcb[0x10] = opcb_10;
    opcb[0x11] = opcb_11;
    opcb[0x12] = opcb_12;
    opcb[0x13] = opcb_13;
    opcb[0x14] = opcb_14;
    opcb[0x15] = opcb_15;
    opcb[0x16] = opcb_16;
    opcb[0x17] = opcb_17;
    opcb[0x18] = opcb_18;
    opcb[0x19] = opcb_19;
    opcb[0x1a] = opcb_1a;
    opcb[0x1b] = opcb_1b;
    opcb[0x1c] = opcb_1c;
    opcb[0x1d] = opcb_1d;
    opcb[0x1e] = opcb_1e;
    opcb[0x1f] = opcb_1f;
    opcb[0x20] = opcb_20;
    opcb[0x21] = opcb_21;
    opcb[0x22] = opcb_22;
    opcb[0x23] = opcb_23;
    opcb[0x24] = opcb_24;
    opcb[0x25] = opcb_25;
    opcb[0x26] = opcb_26;
    opcb[0x27] = opcb_27;
    opcb[0x28] = opcb_28;
    opcb[0x29] = opcb_29;
    opcb[0x2a] = opcb_2a;
    opcb[0x2b] = opcb_2b;
    opcb[0x2c] = opcb_2c;
    opcb[0x2d] = opcb_2d;
    opcb[0x2e] = opcb_2e;
    opcb[0x2f] = opcb_2f;
    opcb[0x30] = opcb_30;
    opcb[0x31] = opcb_31;
    opcb[0x32] = opcb_32;
    opcb[0x33] = opcb_33;
    opcb[0x34] = opcb_34;
    opcb[0x35] = opcb_35;
    opcb[0x36] = opcb_36;
    opcb[0x37] = opcb_37;
    opcb[0x38] = opcb_38;
    opcb[0x39] = opcb_39;
    opcb[0x3a] = opcb_3a;
    opcb[0x3b] = opcb_3b;
    opcb[0x3c] = opcb_3c;
    opcb[0x3d] = opcb_3d;
    opcb[0x3e] = opcb_3e;
    opcb[0x3f] = opcb_3f;
    opcb[0x40] = opcb_40;
    opcb[0x41] = opcb_41;
    opcb[0x42] = opcb_42;
    opcb[0x43] = opcb_43;
    opcb[0x44] = opcb_44;
    opcb[0x45] = opcb_45;
    opcb[0x46] = opcb_46;
    opcb[0x47] = opcb_47;
    opcb[0x48] = opcb_48;
    opcb[0x49] = opcb_49;
    opcb[0x4a] = opcb_4a;
    opcb[0x4b] = opcb_4b;
    opcb[0x4c] = opcb_4c;
    opcb[0x4d] = opcb_4d;
    opcb[0x4e] = opcb_4e;
    opcb[0x4f] = opcb_4f;
    opcb[0x50] = opcb_50;
    opcb[0x51] = opcb_51;
    opcb[0x52] = opcb_52;
    opcb[0x53] = opcb_53;
    opcb[0x54] = opcb_54;
    opcb[0x55] = opcb_55;
    opcb[0x56] = opcb_56;
    opcb[0x57] = opcb_57;
    opcb[0x58] = opcb_58;
    opcb[0x59] = opcb_59;
    opcb[0x5a] = opcb_5a;
    opcb[0x5b] = opcb_5b;
    opcb[0x5c] = opcb_5c;
    opcb[0x5d] = opcb_5d;
    opcb[0x5e] = opcb_5e;
    opcb[0x5f] = opcb_5f;
    opcb[0x60] = opcb_60;
    opcb[0x61] = opcb_61;
    opcb[0x62] = opcb_62;
    opcb[0x63] = opcb_63;
    opcb[0x64] = opcb_64;
    opcb[0x65] = opcb_65;
    opcb[0x66] = opcb_66;
    opcb[0x67] = opcb_67;
    opcb[0x68] = opcb_68;
    opcb[0x69] = opcb_69;
    opcb[0x6a] = opcb_6a;
    opcb[0x6b] = opcb_6b;
    opcb[0x6c] = opcb_6c;
    opcb[0x6d] = opcb_6d;
    opcb[0x6e] = opcb_6e;
    opcb[0x6f] = opcb_6f;
    opcb[0x70] = opcb_70;
    opcb[0x71] = opcb_71;
    opcb[0x72] = opcb_72;
    opcb[0x73] = opcb_73;
    opcb[0x74] = opcb_74;
    opcb[0x75] = opcb_75;
    opcb[0x76] = opcb_76;
    opcb[0x77] = opcb_77;
    opcb[0x78] = opcb_78;
    opcb[0x79] = opcb_79;
    opcb[0x7a] = opcb_7a;
    opcb[0x7b] = opcb_7b;
    opcb[0x7c] = opcb_7c;
    opcb[0x7d] = opcb_7d;
    opcb[0x7e] = opcb_7e;
    opcb[0x7f] = opcb_7f;
    opcb[0x80] = opcb_80;
    opcb[0x81] = opcb_81;
    opcb[0x82] = opcb_82;
    opcb[0x83] = opcb_83;
    opcb[0x84] = opcb_84;
    opcb[0x85] = opcb_85;
    opcb[0x86] = opcb_86;
    opcb[0x87] = opcb_87;
    opcb[0x88] = opcb_88;
    opcb[0x89] = opcb_89;
    opcb[0x8a] = opcb_8a;
    opcb[0x8b] = opcb_8b;
    opcb[0x8c] = opcb_8c;
    opcb[0x8d] = opcb_8d;
    opcb[0x8e] = opcb_8e;
    opcb[0x8f] = opcb_8f;
    opcb[0x90] = opcb_90;
    opcb[0x91] = opcb_91;
    opcb[0x92] = opcb_92;
    opcb[0x93] = opcb_93;
    opcb[0x94] = opcb_94;
    opcb[0x95] = opcb_95;
    opcb[0x96] = opcb_96;
    opcb[0x97] = opcb_97;
    opcb[0x98] = opcb_98;
    opcb[0x99] = opcb_99;
    opcb[0x9a] = opcb_9a;
    opcb[0x9b] = opcb_9b;
    opcb[0x9c] = opcb_9c;
    opcb[0x9d] = opcb_9d;
    opcb[0x9e] = opcb_9e;
    opcb[0x9f] = opcb_9f;
    opcb[0xa0] = opcb_a0;
    opcb[0xa1] = opcb_a1;
    opcb[0xa2] = opcb_a2;
    opcb[0xa3] = opcb_a3;
    opcb[0xa4] = opcb_a4;
    opcb[0xa5] = opcb_a5;
    opcb[0xa6] = opcb_a6;
    opcb[0xa7] = opcb_a7;
    opcb[0xa8] = opcb_a8;
    opcb[0xa9] = opcb_a9;
    opcb[0xaa] = opcb_aa;
    opcb[0xab] = opcb_ab;
    opcb[0xac] = opcb_ac;
    opcb[0xad] = opcb_ad;
    opcb[0xae] = opcb_ae;
    opcb[0xaf] = opcb_af;
    opcb[0xb0] = opcb_b0;
    opcb[0xb1] = opcb_b1;
    opcb[0xb2] = opcb_b2;
    opcb[0xb3] = opcb_b3;
    opcb[0xb4] = opcb_b4;
    opcb[0xb5] = opcb_b5;
    opcb[0xb6] = opcb_b6;
    opcb[0xb7] = opcb_b7;
    opcb[0xb8] = opcb_b8;
    opcb[0xb9] = opcb_b9;
    opcb[0xba] = opcb_ba;
    opcb[0xbb] = opcb_bb;
    opcb[0xbc] = opcb_bc;
    opcb[0xbd] = opcb_bd;
    opcb[0xbe] = opcb_be;
    opcb[0xbf] = opcb_bf;
    opcb[0xc0] = opcb_c0;
    opcb[0xc1] = opcb_c1;
    opcb[0xc2] = opcb_c2;
    opcb[0xc3] = opcb_c3;
    opcb[0xc4] = opcb_c4;
    opcb[0xc5] = opcb_c5;
    opcb[0xc6] = opcb_c6;
    opcb[0xc7] = opcb_c7;
    opcb[0xc8] = opcb_c8;
    opcb[0xc9] = opcb_c9;
    opcb[0xca] = opcb_ca;
    opcb[0xcb] = opcb_cb;
    opcb[0xcc] = opcb_cc;
    opcb[0xcd] = opcb_cd;
    opcb[0xce] = opcb_ce;
    opcb[0xcf] = opcb_cf;
    opcb[0xd0] = opcb_d0;
    opcb[0xd1] = opcb_d1;
    opcb[0xd2] = opcb_d2;
    opcb[0xd3] = opcb_d3;
    opcb[0xd4] = opcb_d4;
    opcb[0xd5] = opcb_d5;
    opcb[0xd6] = opcb_d6;
    opcb[0xd7] = opcb_d7;
    opcb[0xd8] = opcb_d8;
    opcb[0xd9] = opcb_d9;
    opcb[0xda] = opcb_da;
    opcb[0xdb] = opcb_db;
    opcb[0xdc] = opcb_dc;
    opcb[0xdd] = opcb_dd;
    opcb[0xde] = opcb_de;
    opcb[0xdf] = opcb_df;
    opcb[0xe0] = opcb_e0;
    opcb[0xe1] = opcb_e1;
    opcb[0xe2] = opcb_e2;
    opcb[0xe3] = opcb_e3;
    opcb[0xe4] = opcb_e4;
    opcb[0xe5] = opcb_e5;
    opcb[0xe6] = opcb_e6;
    opcb[0xe7] = opcb_e7;
    opcb[0xe8] = opcb_e8;
    opcb[0xe9] = opcb_e9;
    opcb[0xea] = opcb_ea;
    opcb[0xeb] = opcb_eb;
    opcb[0xec] = opcb_ec;
    opcb[0xed] = opcb_ed;
    opcb[0xee] = opcb_ee;
    opcb[0xef] = opcb_ef;
    opcb[0xf0] = opcb_f0;
    opcb[0xf1] = opcb_f1;
    opcb[0xf2] = opcb_f2;
    opcb[0xf3] = opcb_f3;
    opcb[0xf4] = opcb_f4;
    opcb[0xf5] = opcb_f5;
    opcb[0xf6] = opcb_f6;
    opcb[0xf7] = opcb_f7;
    opcb[0xf8] = opcb_f8;
    opcb[0xf9] = opcb_f9;
    opcb[0xfa] = opcb_fa;
    opcb[0xfb] = opcb_fb;
    opcb[0xfc] = opcb_fc;
    opcb[0xfd] = opcb_fd;
    opcb[0xfe] = opcb_fe;
    opcb[0xff] = opcb_ff;
}
function build_opx()
{
    opx = [];
    var i;
    for (i = 0; i < 256; i++) opx[i] = opx_default
    opx[0x09] = opx_09;
    opx[0x19] = opx_19;
    opx[0x21] = opx_21;
    opx[0x22] = opx_22;
    opx[0x23] = opx_23;
    opx[0x24] = opx_24;
    opx[0x25] = opx_25;
    opx[0x26] = opx_26;
    opx[0x29] = opx_29;
    opx[0x2a] = opx_2a;
    opx[0x2b] = opx_2b;
    opx[0x2c] = opx_2c;
    opx[0x2d] = opx_2d;
    opx[0x2e] = opx_2e;
    opx[0x34] = opx_34;
    opx[0x35] = opx_35;
    opx[0x36] = opx_36;
    opx[0x39] = opx_39;
    opx[0x44] = opx_44;
    opx[0x45] = opx_45;
    opx[0x46] = opx_46;
    opx[0x4c] = opx_4c;
    opx[0x4d] = opx_4d;
    opx[0x4e] = opx_4e;
    opx[0x54] = opx_54;
    opx[0x55] = opx_55;
    opx[0x56] = opx_56;
    opx[0x5c] = opx_5c;
    opx[0x5d] = opx_5d;
    opx[0x5e] = opx_5e;
    opx[0x60] = opx_60;
    opx[0x61] = opx_61;
    opx[0x62] = opx_62;
    opx[0x63] = opx_63;
    opx[0x64] = opx_64;
    opx[0x65] = opx_65;
    opx[0x66] = opx_66;
    opx[0x67] = opx_67;
    opx[0x68] = opx_68;
    opx[0x69] = opx_69;
    opx[0x6a] = opx_6a;
    opx[0x6b] = opx_6b;
    opx[0x6c] = opx_6c;
    opx[0x6d] = opx_6d;
    opx[0x6e] = opx_6e;
    opx[0x6f] = opx_6f;
    opx[0x70] = opx_70;
    opx[0x71] = opx_71;
    opx[0x72] = opx_72;
    opx[0x73] = opx_73;
    opx[0x74] = opx_74;
    opx[0x75] = opx_75;
    opx[0x77] = opx_77;
    opx[0x7c] = opx_7c;
    opx[0x7d] = opx_7d;
    opx[0x7e] = opx_7e;
    opx[0x84] = opx_84;
    opx[0x85] = opx_85;
    opx[0x86] = opx_86;
    opx[0x8c] = opx_8c;
    opx[0x8d] = opx_8d;
    opx[0x8e] = opx_8e;
    opx[0x94] = opx_94;
    opx[0x95] = opx_95;
    opx[0x96] = opx_96;
    opx[0x9c] = opx_9c;
    opx[0x9d] = opx_9d;
    opx[0x9e] = opx_9e;
    opx[0xa4] = opx_a4;
    opx[0xa5] = opx_a5;
    opx[0xa6] = opx_a6;
    opx[0xac] = opx_ac;
    opx[0xad] = opx_ad;
    opx[0xae] = opx_ae;
    opx[0xb4] = opx_b4;
    opx[0xb5] = opx_b5;
    opx[0xb6] = opx_b6;
    opx[0xbc] = opx_bc;
    opx[0xbd] = opx_bd;
    opx[0xbe] = opx_be;
    opx[0xcb] = function(z) {
		var ixy_d = ixy(z);
		//z.reg.tmp = z.mem[ixy_d];
		z.reg.tmp = load8( z, ixy_d );
		return opxcb[ fetch_opcode( z ) ]( z, ixy_d );
 }

    opx[0xe1] = opx_e1;
    opx[0xe3] = opx_e3;
    opx[0xe5] = opx_e5;
    opx[0xe9] = opx_e9;
    opx[0xf9] = opx_f9;
}
function build_opxcb()
{
    opxcb = [];
    var i;
    for (i = 0; i < 256; i++) opxcb[i] = opxcb_default
    opxcb[0x06] = opxcb_06;
    opxcb[0x0e] = opxcb_0e;
    opxcb[0x16] = opxcb_16;
    opxcb[0x1e] = opxcb_1e;
    opxcb[0x26] = opxcb_26;
    opxcb[0x2e] = opxcb_2e;
    opxcb[0x36] = opxcb_36;
    opxcb[0x3e] = opxcb_3e;
    opxcb[0x46] = opxcb_46;
    opxcb[0x4e] = opxcb_4e;
    opxcb[0x56] = opxcb_56;
    opxcb[0x5e] = opxcb_5e;
    opxcb[0x66] = opxcb_66;
    opxcb[0x6e] = opxcb_6e;
    opxcb[0x76] = opxcb_76;
    opxcb[0x7e] = opxcb_7e;
    opxcb[0x86] = opxcb_86;
    opxcb[0x8e] = opxcb_8e;
    opxcb[0x96] = opxcb_96;
    opxcb[0x9e] = opxcb_9e;
    opxcb[0xa6] = opxcb_a6;
    opxcb[0xae] = opxcb_ae;
    opxcb[0xb6] = opxcb_b6;
    opxcb[0xbe] = opxcb_be;
    opxcb[0xc6] = opxcb_c6;
    opxcb[0xce] = opxcb_ce;
    opxcb[0xd6] = opxcb_d6;
    opxcb[0xde] = opxcb_de;
    opxcb[0xe6] = opxcb_e6;
    opxcb[0xee] = opxcb_ee;
    opxcb[0xf6] = opxcb_f6;
    opxcb[0xfe] = opxcb_fe;
}
function build_all()
{
	build_op();
	build_oped();
	build_opcb();
	build_opx();
	build_opxcb();
}

if ( AutoInitEmu ) {
  init();
}


if ( typeof window !== 'object' ) {
  module.exports = Z80;
}


