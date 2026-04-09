
// Copyright (C) 2026 Brian Sheldon
//
// MIT License

if ( typeof window !== 'object' ) {
  //global.EmuTestSub = require( './emu.test.sub.js' );
  global.EmuLed = require( './led.js' );
  global.EmuSys = require( '../sys/sys.js' );
}

class EmuCmdSys {
  constructor( mon ) {
    log.debug( 'EmuCmdSys constructed ...' );
    this._mon = mon;
    this.led = new EmuLed();
    console.log( typeof( this._mon ) );
    this.init();
  }
  hi() {
    log.out( 'Hi from EmuCmdSys ...' );
  }
  get mon() {
    return this._mon;
  }
  init() {
    let mon = this.mon;
    this.systems = {};
    this.cpmCount = 0;
    this.cpmSystems = [];
    this.file = './disks/cpm/cpma.cpm';
    this.cyls = 1;
    this.trks = 77;
    this.secs = 26;
    this.secSize = 128;
    this.blkSize = 1024;
    this.extents = 64;
    this.extentTrk = 2;
    this.logSecAuto = true;
    this.logSec = false;
    this.trk = 0;
    this.sec = 1;
    this.extent = 1;
    //
    this.addr = 0;
    //this.mem.init();
    //mon.disk = new EmuDisk( this.file, this.cyls, this.trks, this.secs, this.secSize );
    //log.out( typeof( this.disk ) );
  }
  addSystem( io, proc, type ) {
    io.line( 'Creating ' + type + ' system ...' );
    let sys;
    switch ( type ) {
      case 'cpm':
        let type = 'cpm';
        let name = type + '-' + this.cpmCount;
        sys = new EmuSys( proc, type, name );
        let state = sys.state;
        state.processor = proc;
        state.addr = 0;
        state.run = false;
        this.cpmCount++;
        this.cpmCurrent = sys.name;
        this.cpmSystems.push( sys.name );
        break;
    }
    this.systems[ sys.name ] = sys;
    this.sys = sys;
    emu.sys = sys;
    io.line( 'System set to ' + sys.name + ' ...' );
  }
  //
  // disks - cmd
  //
  nextSector() {
  }
  nextExtent() {
    this.extent = this.extent < 64 ? this.extent + 1 : 1 ;
  }
  cpm() {
  }
  exec( io, cmd, repeat ) {
    let mon = this.mon;
    let parms = cmd.split( ' ' );
    let plen = parms.length;
    let p0 = plen > 0 ? parms[0] : '' ;
    let p1 = plen > 1 ? parms[1] : '' ;
    let p2 = plen > 2 ? parms[2] : '' ;
    let p3 = plen > 3 ? parms[3] : '' ;
    let p4 = plen > 4 ? parms[4] : '' ;
    let sys, cpu, mem, state, trace;
    if ( ! this.sys ) {
      let allowed = [ '', 'cpm', 'zz', 'newsys', 'cpu', 'romload', 'help' ];
      if ( allowed.includes( p0 ) ) {
      } else {
        p0 = '';
        io.line( 'System Not Configured. Select System ...' );
        io.line( '  cpm' );
      }
    } else {
      sys = this.sys;
      cpu = sys.cpu;
      mem = cpu.mem;
      state = sys.state;
      //trace = sys.cpu.trace;
    }
    //console.log( state );
    let pass = false;
    let defCmd = '';
    switch ( p0 ) {
      case 'systest':
        var tst = parms.length > 1 ? parseInt( parms[1] ) : 1 ;
        io.write( '.' );
        let test = new Test( log.write );
        io.write( '.' );
        //let log = test.run( tst );
        //log.write( log );
        break;
      case 'cpmload':
        io.line( 'cpmload' );
        if ( plen > 2 ) {
          var file = 'cpm/' + p1;
          var addr = parseInt( p2, 16 );
          var bytes = fs.readFileSync( file );
          var len = bytes.length;
          for ( let b = 0; b < len; b ++ ) {
            let byt = bytes[ b ];
            mem[ addr + b ] = byt;
          }
        }
        break;
      case 'cpmsave':
        io.line( 'cpmsave' );
        if ( plen > 3 ) {
          var file = 'cpm/' + p1;
          var addr = parseInt( p2, 16 );
          var len = parseInt( p3, 16 );
          fs.writeFileSync( file, mem.slice( addr, len ) );
        }
        break;
      case 'romload':
        io.line( 'romload ...' );
        if ( plen > 2 ) {
          var file = 'roms/' + p1;
          var addr = parseInt( p2, 16 );
          io.line( 'File: ' + file );
          io.line( 'Addr: ' + addr );
          if ( fs.existsSync( file ) ) {
            io.line( 'Loading: ' + file );
            var bytes = fs.readFileSync( file );
            var len = bytes.length;
            for ( let b = 0; b < len; b ++ ) {
              let byt = bytes[ b ];
              mem[ addr + b ] = byt;
            }
          } else {
            io.line( 'File not found: ' + file );
          }
        }
        break;
      case 'trsload':
        io.line( 'trsload ...' );
        if ( plen > 1 ) {
          var file = 'trs/' + p1;
          io.line( 'File: ' + file );
          if ( fs.existsSync( file ) ) {
            io.line( 'Loading: ' + file );
            var bytes = fs.readFileSync( file );
            var len = bytes.length;
            let b = 0;
            while ( b < len ) {
              var type = bytes[ b++ ];
              switch ( type ) {
                case 1:
                  var reclen = bytes[ b++ ] - 2;
                  var l = bytes[ b++ ];
                  var h = bytes[ b++ ];
                  var addr = h * 0x100 + l;
                  var haddr = addr.toString( 16 ).padStart( 2, '0' );
                  io.line( 'Loading: ' + reclen + ' bytes to: ' + haddr );
                  for ( var i = 0; i < reclen; i++ ) {
                    var byt = bytes[ b++ ];
                    mem[ addr + i ] = byt;
                  }
                  break;
                case 2:
                  var reclen = bytes[ b++ ];
                  var l = bytes[ b++ ];
                  var h = bytes[ b++ ];
                  var addr = h * 0x100 + l;
                  var haddr = addr.toString( 16 ).padStart( 2, '0' );
                  io.line( 'Run Address: ' + haddr );
                  break;
                default:
                  io.line( 'Unknown Type: ' + type );
                  break;
              }
            }
          } else {
            io.line( 'File not found: ' + file );
          }
        }
        break;
      case 'move':
        if ( plen > 3 ) {
          var src = parseInt( p1, 16 );
          var dst = parseInt( p2, 16 );
          var len = parseInt( p3, 16 );
          for ( var i = 0; i < len; i++ ) {
            if ( true ) { // check bounds ... todo
              mem[ dst + i ] = mem[ src + i ];
            }
          }
        }
        break;
      case 'z':
        var addr = state.addr;
        if ( plen > 1 ) {
          addr = parseInt( p1, 16 );
        }
        for ( var i = 0; i < 16; i++ ) {
          var bytes, inst;
          [ nextaddr, bytes, inst ] = sys.z80dis.dis1( mem, addr );
          var line = '';
          var sep = '';
          line += addr.toString( 16 ).padStart( 4, '0' );
          line += '  ';
          for ( var j = 0; j < 5; j++ ) {
            if ( j < bytes.length ) {
              var byt = bytes[ j ];
              line += sep + byt.toString( 16 ).padStart( 2, '0' );
              sep = ' ';
            } else {
              line += '   ';
            }
          }
          line += '  ' + inst;
          io.line( line );
          addr = nextaddr;
          state.addr = nextaddr & 0xffff;
        }
        defCmd = p0;
        break;
      case 'callfind':
        if ( plen > 3 ) {
          var start = parseInt( p1, 16 );
          var range1 = parseInt( p2, 16 );
          var range2 = parseInt( p3, 16 );
          var count = 0;
          for ( var addr = start; addr < 0xfffd; addr++ ) {
            var c1 = mem[ addr ];
            if ( c1 == 0xcd ) {
              var c2 = mem[ addr + 1 ];
              var c3 = mem[ addr + 2 ];
              var dst = c3 * 256 + c2;
              var haddr = addr.toString( 16 ).padStart( 4, '0' );
              var hdst = dst.toString( 16 ).padStart( 4, '0' );
              if ( range1 <= dst && range2 >= dst ) {
                io.line( 'Call from: ' + haddr + ' to: ' + hdst );
              }
            }
          }
        }
        break;
      case 'memfind':
        if ( plen > 2 ) {
          var start = parseInt( p1, 16 );
          var b1 = parseInt( p2, 16 );
          var b2 = parseInt( p3, 16 );
          var b3 = parseInt( p4, 16 );
          var count = 0;
          for ( var addr = start; addr < 0xffff; addr++ ) {
            var c1 = mem[ addr ];
            var c2 = mem[ addr + 1 ];
            var c3 = mem[ addr + 2 ];
            var found = false;
            switch ( plen ) {
              case 3:
                found = ( b1 == c1 );
                break;
              case 4:
                found = ( b1 == c1 && b2 == c2 );
                break;
              case 5:
                found = ( b1 == c1 && b2 == c2 && b3 == c3 );
                break;
            }
            if ( count < 32 && found ) {
              var haddr = addr.toString( 16 ).padStart( 2, '0' );
              io.line( 'Found at: ' + haddr );
              count++;
            }
          }
        }
        break;
      case 'sendcr':
        sys.key( { code: '\n' } )
        break;;
      case 'sendkey':
        if ( plen > 1 ) {
          var s = parms.slice( 1 ).join( ' ' ) + '\n';
          sys.key( { code: '\n' } );
          for ( var i in s ) {
            var ch = s.charAt( i );
            //console.log( typeof( ch ) );
            sys.key( { code: ch } );
          }
          //
        }
        break;
      case 'b':
        //if ( state.processor == 'cpu' ) {
          //state.disk.secRead( 0, 0, 1, sys.cpu.mem, 0 );
        //} else {
          state.disk.secRead( 0, 0, 1, mem, 0 );
        //}
        io.line( 'boot sector loaded at address: 0000' );
        break;
      case 'hi':
        io.line( 'cpu on: ' + cpu.state.on );
        io.line( 'cpu pc: ' + sys.cpu.reg.pc );
        break;
      case 'on':
        io.line( 'cpu on: ' + cpu.state.on );
        io.line( 'cpu pc: ' + cpu.reg.pc );
        state.on = true;
        io.line( 'cpu on: ' + cpu.state.on );
        break;
      case 'off':
        io.line( 'cpu on: ' + cpu.state.on );
        io.line( 'cpu pc: ' + cpu.reg.pc );
        state.on = false;
        io.line( 'cpu on: ' + cpu.state.on );
        break;
      //
      // trace cmds
      //
      case 'mclr':
        cpu.trace.memTraceClr();
        io.line( 'mem trace cleared ...' );
        break;
      case 'cclr':
        cpu.trace.cpuTraceClr();
        io.line( 'cpu trace cleared ...' );
        break;
      case 'msave':
        var name = plen > 1 ? p1 : '' ;
        var path = cpu.trace.memTraceSave( name );
        io.line( 'mem trace saved as ' + path + ' ...' );
        break;
      case 'csave':
        var name = plen > 1 ? p1 : '' ;
        var path = cpu.trace.cpuTraceSave( name );
        io.line( 'cpu trace saved as ' + path + ' ...' );
        break;
      case 'ms':
      case 'mstr':
        var s = cpu.trace.memTraceString();
        io.line( s );
        break;
      case 'cs':
      case 'cstr':
        var s = cpu.trace.cpuTraceString();
        io.line( s );
        break;
      case 'ml':
      case 'mlist':
        var s = cpu.trace.memTraceList();
        io.line( s );
        break;
      case 'cl':
      case 'clist':
        var s = cpu.trace.cpuTraceList();
        io.line( s );
        break;
      //
      //
      //
      case 'cpm':
      case 'zz':
        var proc = 'cpu';
        if ( plen > 1 ) {
          proc = p1;
        }
        io.line( 'Proc: ' + proc );
        this.addSystem( io, proc, 'cpm' );
        break;
      case 'x':
        var s = cpu.stateStr();  //sys.cpu.regs();
        io.line( s );
        //io.line( sys.cpu.pc );
        //io.line( sys.cpu.reg.HL );
        //io.line( sys.cpu.setRegisters( parms ) );
        //io.write( sys.cpu.cpuStatus() );
        defCmd = p0;
        break;
      case 'fl':
        // not working
        var find, addr, n;
        var sa, line, next;
        if ( plen > 2 ) {
          find = p1
          addr = parseInt( p2, 16 );
          n = parseInt( p3, 16 );
          for ( var i = addr; i < addr + n; i++ ) {
            sa = sys.i8080.disassemble1( i );
            line = sa[ 1 ];
            next = sa[ 0 ];
            if ( line.toLowerCase().includes( find ) ) {
              io.line( line );
              sa = sys.i8080.disassemble1( next );
              line = sa[ 1 ];
              next = sa[ 0 ];
              io.line( line );
            }
            i = next;
          }
        }
        break;
      case 'l':
        if ( plen > 1 ) {
          sys.state.address = parseInt( p1, 16 );
        }
        var n = plen > 2 ? parseInt( p2 ) : 8 ;
        var nextaddr, lines;
        [ nextaddr, lines ] = cpu.disLines( n, sys.state.address );
        io.line( lines );
        sys.state.address = nextaddr; 
        defCmd = p0;
        break;
      case 'mem':
        if ( plen > 1 ) {
          var hex = emu.hex;
          var addr = parseInt( p1, 16 );
          var byt = mem[ addr ];
          io.line( 'addr: ' + hex.w( addr ) + ' byte: ' + hex.b( byt )  );
          if ( plen > 2 ) {
            var b = parseInt( p2, 16 );
            mem[ addr ] = b;
            byt = mem[ addr ];
            io.line( 'addr: ' + hex.w( addr ) + ' byte: ' + hex.b( byt )  );
          }
        }
        break;
      case 'bp0':
        if ( plen > 1 ) {
          var bp = parseInt( p1, 16 );
          var op = mem[ bp ];
          sys.state.bp0addr = bp;
          sys.state.bp0op = op;
          mem[ bp ] = 0x76;
        }
        io.line();
        break;
      case 'bp0clr':
        mem[ sys.state.bp0addr ] = sys.state.bp0op;
        //sys.state.bp0addr = 0;
        //sys.state.bp0op = 0;
        io.line();
        break;
      case 'halt':
        io.line( state.halted );
        sys.cpu.halt( true );
        state.halted = true;
        io.line( state.halted );
        break;
      case 'haltclr':
        io.line( state.halted );
        sys.cpu.halt( false );
        state.halted = false;
        io.line( state.halted );
        break;
      case 'stopclr':
        io.line( 'stopchk: ' + state.stopchk );
        io.line( 'stop: ' + state.stop );
        sys.state.stopaddr = -1;
        sys.state.stopat = false;
        sys.state.running = true;
        io.line( 'stopchk: ' + state.stopchk );
        io.line( 'stop: ' + state.stop );
        break;
      case 'stopat':
        io.line( 'stopchk: ' + state.stopchk );
        io.line( 'stop: ' + state.stop );
        if ( plen > 1 ) {
          var sa = parseInt( p1, 16 );
          sys.state.stopaddr = sa;
        }
        io.line( 'stopaddr: ' + state.stopaddr );
        io.line( 'stopchk: ' + state.stopchk );
        io.line( 'stop: ' + state.stop );
        break;
      case 'step2':
      case 'stepto':
        if ( plen == 2 ) {
          var stepto = p1;
          var steps = stepto - state.steps;
          this.step( io, sys, state, steps, true );
        }
        break;
      case 'cpuview':
        var steps = plen > 1 ? parseInt( p1 ) : 1 ;
        io.line( 'Cycles: ' + sys.cpustep( steps ) );
        defCmd = p0;
        break;
      case 'cpu':
        if ( plen > 1 ) {
          switch ( p1 ) {
            case 'get':
              console.log( sys.cpu.get() );
              break;
            case 'step':
              var n = 1;
              if ( plen > 2 ) {
                n = parseInt( p2 );
              }
              for ( var i = 0; i < n; i++ ) {
                io.line( sys.cpu.disLine( sys.cpu.reg.pc, '   ', '   ' ) );
                sys.cpu.step();
                io.line( sys.cpu.reg.state() );
                if ( i == n - 1 ) {
                  io.line( sys.cpu.disLine( sys.cpu.reg.pc, '   ', '   ' ) );
                  io.line( sys.cpu.runState() );
                }
                io.line( sys.cpu.tickState() );
              }
              break;
            case 'state':
              io.line( sys.cpu.disLine( sys.cpu.reg.pc, '   ', '   ' ) );
              io.line( sys.cpu.reg.state() );
              io.line( sys.cpu.runState() );
              io.line( sys.cpu.tickState() );
              io.line( sys.cpu.mhzState() );
              break;
            case 'cputrace':
              var t = sys.cpu.cpuTrace;
              for ( var addr = 0; addr < 0x10000; addr++ ) {
                if ( t[ addr ] != 0 ) {
                  io.line( addr + ' : ' + t[ addr ] );
                }
              }
              break;
            case 'rdtrace':
              var t = sys.cpu.rdTrace;
              for ( var addr = 0; addr < 0x10000; addr++ ) {
                if ( t[ addr ] != 0 ) {
                  io.line( addr + ' : ' + t[ addr ] );
                }
              }
              break;
            case 'wrtrace':
              var t = sys.cpu.wrTrace;
              for ( var addr = 0; addr < 0x10000; addr++ ) {
                if ( t[ addr ] != 0 ) {
                  io.line( addr + ' : ' + t[ addr ] );
                }
              }
              break;
            case 'rwstrace':
              io.line( sys.cpu.rwsTrace );
              break;
            case 'dump':
              var addr = plen > 2 ? parseInt( p2, 16 ) : 0 ;
              var rows = plen > 3 ? parseInt( p3 ) : 8 ;
              var cols = plen > 4 ? parseInt( p4 ) : 16 ;
              io.line( sys.cpu.memDump( sys.cpu.mem, addr, rows, cols ) );
              break;
            case 'forth':
              var data = fs.readFileSync( 'roms/forth.bin' );
              for ( var i = 0; i < data.length; i++ ) {
                sys.cpu.mem[ 0x8000 + i ] = data[ i ];
              }
              sys.cpu.reg.pc = 0x8000;
              break;
            case 'forth2':
              var data = fs.readFileSync( 'roms/forth2.bin' );
              for ( var i = 0; i < data.length; i++ ) {
                sys.cpu.mem[ 0x8000 + i ] = data[ i ];
              }
              sys.cpu.reg.pc = 0x8000;
              break;
          }
        }
        break;
      case 'stat':
        var next, line;
        [ next, line ] = sys.cpu.disLine( sys.cpu.reg.pc, '   ', '   ' );
        io.line( line );
        io.line( sys.cpu.reg.state() );
        [ next, line ] = sys.cpu.disLine( sys.cpu.reg.pc, '   ', '   ' );
        io.line( line );
        io.line( sys.cpu.runState() );
        io.line( sys.cpu.tickState() );
        break;
      case 'step':
        var next, line;
        var steps = plen > 1 ? parseInt( p1 ) : 1 ;
          for ( var i = 0; i < steps; i++ ) {
            [ next, line ] = sys.cpu.disLine( sys.cpu.reg.pc, '   ', '   ' );
            io.line( line );
            if ( state.running ) {
              sys.cpu.step();
            }
            io.line( sys.cpu.reg.state() );
            if ( i == steps - 1 ) {
              [ next, line ] = sys.cpu.disLine( sys.cpu.reg.pc, '   ', '   ' );
              io.line( line );
              io.line( sys.cpu.runState() );
            }
            io.line( sys.cpu.tickState() );
          }
        defCmd = p0;
        break;
      case 'tick':
        var ticks = plen > 1 ? parseInt( p1 ) : 1 ;
        this.step( io, sys, state, ticks, false );
        defCmd = p0;
        break;
      case 'mst':
        io.line( 'Milliseconds/Frame: ' + sys.ms );
        if ( plen > 1 ) {
          sys.ms = parseInt( p1 );
          io.line( 'Milliseconds/Frame set to: ' + sys.ms );
        }
        break;
      case 'loops':
        io.line( 'Steps/Frame: ' + sys.stepLoops );
        if ( plen > 1 ) {
          sys.stepLoops = parseInt( p1 );
          io.line( 'Steps/Frame set to: ' + sys.stepLoops );
        }
        break;
      case 'perf':
        var ms = state.tavg.ms;
        var span = state.tavg.span;
        var time = span * ms / 1000;
        var frames = state.tavg.frames;
        var pframe = state.tavg.frame / time * 100;
        var pio = state.tavg.io / time * 100;
        var pcpu = state.tavg.cpu / time * 100;
        var ttime = ( performance.now() - state.tavg.beginning ) / 1000;
        var fps = frames / ttime;
        io.line( 'Time: ' + ttime );
        io.line( 'Frames: ' + fps );
        io.line( 'ms: ' + ms );
        io.line( 'Max frame: ' + state.tavg.mframe );
        io.line( 'Max io: ' + state.tavg.mio );
        io.line( 'Max cpu: ' + state.tavg.mcpu );
        io.line( 'Max ticks: ' + state.tavg.mticks );
        //io.line( 'Frame: ' + state.tavg.frame );
        //io.line( 'io: ' + state.tavg.io );
        //io.line( 'cpu: ' + state.tavg.cpu );
        //io.line( 'Frames: ' + frames );
        //io.line( '% Frame: ' + pframe );
        //io.line( '% io: ' + pio );
        //io.line( '% cpu: ' + pcpu );
        defCmd = 'perf';
      case 'newsys':
        if ( plen > 1 ) {
          this.addSystem( io, p1 );
        }
        break;
      case 'd':
        var s = '';
        var addr = plen > 1 ? parseInt( p1, 16 ) : sys.state.address ;
        io.line( 'Addr: ' + emu.hex.w( addr ) );
        //if ( state.processor == 'cpu' ) {
          //s = emu.hex.lines( sys.mem, addr, 16, 16 );
          //s = emu.hex.lines( sys.cpu.mem, addr, 16, 16 );
        //} else {
          s = emu.hex.lines( mem, addr, 16, 16 );
        //}
        io.line( s );
        sys.state.address = addr + 0x100;
        defCmd = p0;
        break;
      case 'led':
        if ( plen == 2 ) {
          sys.state.ledaddr = p1;
        }
        var s = '';
        if ( ! sys.state.ledaddr ) {
          sys.state.ledaddr = sys.state.addr;
        }
        var addr = plen > 1 ? parseInt( p1, 16 ) : sys.state.ledaddr ;
        sys.state.ledaddr = addr;
        var byt = cpu.mem[ addr ];
        var h = emu.hex.w( addr ) + ' ' + emu.hex.b( byt );
        var led = this.led.drawLine( h );
        if ( repeat ) {
          io.write( '\x1b[8A\r' );
        }
        io.write( led );
        sys.state.ledaddr = ( sys.state.ledaddr + 1 ) & 0xffff;
        sys.state.lastCommand = 'led';
        defCmd = p0;
        break;
      case 'cpmx':
        io.line( 'Current system: '  + emu.sys.name );
        var s;
        for ( s of this.cpmSystems ) {
          io.line( s );
        }
        var cpm = '';
        if ( plen == 1 ) {
          if ( this.cpmCurrent ) {
            cpm = this.cpmCurrent;
          }
        } else {
          p1 = 'cpm-' + p1;
          if ( this.cpmSystems.includes( p1 ) ) {
            cpm = p1;
          }
        }
        if ( cpm != '' ) {
          sys = this.systems[ cpm ];
          io.line( 'system set to ' + cpm + ' ...' );
        } else {
          io.line( 'no cpm systems have been created ...' );
        }
        break;
      case 'help':
        if ( plen == 1 ) {
          io.write( 'help sys   list system commands' );
        } else if ( p1 == 'sys' ) {
          io.line( '-------------------- system commands --------------------' );
          io.line( 'disk    view next sector and' );
          io.line( '        automatcally update next sector.' );
          io.line( '        Logical sector table will apply' );
          io.line( '        when applicable, not used on system trks.' );
          io.line( 'dir     vieww next dir sector.' );
          io.line( 'extents view all used directory extents.' );
          io.line( 'extent  view next extent.' );
          io.line( 'fat     view table of used blocks with extent number' );
          io.line( '        ,generated, not on disk.' );
        }
        break;
    }
    return defCmd;
  }

  step( io, sys, state, steps, bysteps = true ) {
    let count = 0;
    let ticks = 0;
    while ( count < steps ) {
      if ( steps != 0 ) {
        io.write( '>>> step' + '\r\n' );
      }
      ticks = sys.cpu.steps( 1, bysteps );
      var s = sys.cpuStateStr();
      io.line( s );
      if ( state.coninwait || state.stop || state.halted ) {
        break;
      }
      if ( bysteps ) {
        count++;
      } else {
        if ( ticks == 0 ) {
          count++;
        } else {
          count += ticks;
        }
      }
    }
    if ( state.coninwait ) {
      io.line( 'system is waiting for io ...' );
    }
    if ( state.stop ) {
      io.line( 'system has reached stop address ...' );
    }
    if ( state.halted ) {
      io.line( 'system is halted ...' );
    }
  }
}


if ( typeof window !== 'object' ) {
  module.exports = EmuCmdSys;
}

