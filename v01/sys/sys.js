
if ( typeof window !== 'object' ) {
  global.EmuDiskCpm = require( '../emu.disk.cpm.js' );
  //global.EmuSysTrace = require( './emu.sys.trace.js' );
  global.Cpu80 = require( '../cpu/cpu.80.js' );
  //global.PreSim8080 = require( './cpu/8080/8080.js' );
  //global.CPU8080 = require( './cpu/8080/sim8080.js' );
  //global.I8080 = require( './cpu/8080/js8080.js' );
  //global.Z80 = require( './cpu/z80/z.op.js' );
  global.Z80Dis = require( '../cpu/z80/z.dis.js' );
}

class EmuSys {
  constructor( proc, type, name ) {
    log.debug( 'EmuSys constructed ...' );
    this.cpuemu = proc;
    this._type = type;
    this._name = name;
    //this._mon = mon;
    //this._mem = new EmuSysMem();
    //this._cpu = new EmuSysCpu();
    console.log( 'New System: ' + proc );
    this.init();
    this.port66 = 0xff;
  }
  hi() {
    log.out( 'Hi from EmuSys ...' );
  }
  init() {
    let self = this;
    // sys state init - needs to be separated from cpu state
    let state = this._state;
    // io init
    this.inpQueue = [];
    // cpu init
    this.cpuemu = 'cpu';
    this._cpu = new Cpu80( 1, this );
    this.z80dis = Z80Dis;
    // disk init
    this.initDisks();
    this.drv = 0;
    this.trk = 0;
    this.sec = 1; // sector numbers start at 1
    this.dma = 0x0000;
    this.dskstat = 0; // diskstatus
    this.iocount = 0; // number of pending requests
    this.writeCompleteCB = null; // will be called after drive formatting
    // sys state init
    this.dumpdata = "";
    this.state.address = 0;
    this.state.ticks = 0;
    this.state.steps = 0;
    this.state.ops = 0;
    this.state.stopchk = false;
    this.state.stop = false;
    this.frames();
  }
  w( n ) {
    return n.toString( 16 ).padStart( 4, '0' );
  }
  get drv() {
    return this.state.drv;
  }
  set drv( drv ) {
    this.state.drv = drv;
    this.state.disk = this.disks[ drv ];
  }
  get cpu() {
    return this._cpu;
  }
  get state() {
    return this._cpu.state;
  }
  get type() {
    return this._type;
  }
  get name() {
    return this._name;
  }
  get mon() {
    return this._mon;
  }
  get ram() {
    return this._mem;
  }
  get mem() {
    if ( this.cpuemu == 'cpu' ) {
      //return this.cpu.mem;
      return this._mem;
    } else {
      return this._mem;
    }
  }
  get i8080() {
    return this._i8080;
  }
  get z80() {
    return this._z80;
  }
  set cpu( cpu ) {
    this._cpu = cpu;
  }
  // ****************************************
  //
  // mount disks
  //
  // ****************************************
  initDisks() {
    this.disks = [];
    let fdisk = {
      cyls: 1,
      trks: 77,
      secs: 26,
      secsize: 128,
      usesTranslate: true,
      translateTable: [
        1,7,13,19,
        25,5,11,17,
        23,3,9,15,
        21,2,8,14,
        20,26,6,12,
        18,24,4,10,
        16,22
      ],
      blktrk: 2,
      blksecs: 8,
      extsize: 32,
      exts: 64
    };
    let hdisk = {
      cyls: 1, 
      trks: 255,
      secs: 128,
      secsize: 128,
      usesTranslate: false,
      translateTable: [],
      blktrk: 0,
      blksecs: 16,
      extsize: 32,
      exts: 1024
    };
    let os = 'cpm2.2';
    switch ( os ) {
      case 'cpm1.3':
        this.disks[ 0 ] = new EmuDiskCpm(
          {
            drv: 0,
            path: 'disks/live/',
            filename: 'cpm13.dsk'
          },
          fdisk
        );
        break
      case 'cpm1.4':
        this.disks[ 0 ] = new EmuDiskCpm(
          {
            drv: 0,
            path: 'disks/live/',
            filename: 'cpm14.dsk'
          },
          fdisk
        );
        break
      case 'cpm2.2':
        this.disks[ 0 ] = new EmuDiskCpm(
          {
            drv: 0,
            path: 'disks/live/',
            filename: 'cpm22-1.dsk'
          },
          fdisk
        );
        this.disks[ 1 ] = new EmuDiskCpm(
          {
            drv: 1,
            path: 'disks/live/',
            filename: 'cpm22-2.dsk'
          },
          fdisk
        );
        break;
      case 'cpm3.0':
        this.disks[ 0 ] = new EmuDiskCpm(
          {
            drv: 0,
            path: 'disks/live/',
            filename: 'cpm3-1.dsk'
          },
          fdisk
        );
        this.disks[ 1 ] = new EmuDiskCpm(
          {
            drv: 1,
            path: 'disks/live/',
            filename: 'cpm3-2.dsk'
          },
          fdisk
        );
        break;
    }
    this.disks[ 2 ] = new EmuDiskCpm(
      {
        drv: 2,
        path: 'disks/8080test/',
        filename: '8080tools.cpm'
        //path: 'disks/cpm/',
        //filename: 'volks4th.cpm'
        //filename: 'cpma.cpm'
      },
      fdisk
    );
    this.disks[ 3 ] = new EmuDiskCpm(
      {
        drv: 3,
        //path: 'disks/cpm/',
        //filename: 'volks4th2.cpm'
        path: 'disks/cpm/trek/',
        filename: 'trek.cpm'
      },
      fdisk
    );
    if ( true ) {
      this.disks[ 8 ] = new EmuDiskCpm(
        {
          drv: 8,
          path: 'disks/cpm/',
          filename: 'hd1.dsk'
        },
        hdisk
      );
      this.disks[ 9 ] = new EmuDiskCpm(
        {
          drv: 9,
          path: 'disks/cpm/',
          filename: 'hd2.dsk'
        },
        hdisk
      );
    }
    //
    // test one disk
    //
    let disk = this.disks[ 0 ];
    let buffer = new Uint8Array( disk.secsize );
    let res = disk.rd( 0, 0, 1, buffer, 0 );
    //console.log( res );
  }
  // ****************************************
  //
  // IO Subsystem
  //
  // ****************************************
  inp( port ) {
    return this.input( port );
  }
  out( port, b ) {
    this.output( port, b );
  }
  input( port ) {
    //console.log( 'port in: ' + port );
    // port 0 is console status (0xff == input avail, else 00)
    // port 1 is console input
    switch (port) {
      case 0: // console status 0xff input avail 0x00 not
        //return this.cs() ? 0xff : 0x00;
        return this.inpQueue.length > 0 ? 0xff : 0x00 ;
        break;
      case 1:
        if ( this.inpQueue.length > 0 ) {
          var key = this.inpQueue[ 0 ];
          this.inpQueue = this.inpQueue.slice( 1 );
          return key.charCodeAt( 0 );
        } else {
          this.state.coninwait = true;
          this.state.running = false;
          return 0xff; // any value as it is replaced when io available
        }
        break;
      case 2:
        return 0xff;
        break;
      case 4:
        return 0xff; // always input avail (at least CTRL-Z)
        break;
      case 5:  // auxin == paper tape
        //if (this.tapepos >= this.tape.length) return 0x1a; // CTRL-Z
        //return this.tape.charCodeAt(this.tapepos++) & 0xff;
        return 0xff;
        break;
      case 10: // 0x0a FDC drive
        return this.drv;
        break;
      case 11: // 0x0b FDC track
        return this.trk;
        break;
      case 12: // 0x0c FDC sector
        return this.sec;
        break;
      case 13: // 0x0d FDC command IO ready?
        return this.iocount == 0 ? 0xff : 0x00 ;
        break;
      case 14: // 0x0e FDC status
        return this.dskstatus;
        break;
      case 15: // 0x0f DMA low
        return this.dma & 0xff;
        break;
      case 16: // 0x10 DMA high
        return (this.dma & 0xff00) >> 8;
        break;
      case 0x42:  // 0x42 - 0x00 when cmd is finished executing
        // cp/m reads this to check if mon cmd done
        return this.port66;
        break;
      case 0x44:
        if ( typeof( this.state.port44started ) == 'undefined' ) {
          this.state.port44started = false;
        }
        if ( ! this.state.port44started ) {
          this.state.port44started = true;
          this.state.port44record = 0;
          let sfn = '';
          let dfn = '';
          for ( let i = 0; i < 11; i++ ) {
            if ( i == 8 ) {
              sfn += '.';
              dfn += '.';
            }
            sfn += String.fromCharCode( this.cpu.mem[ 0x5d + i ] );
            dfn += String.fromCharCode( this.cpu.mem[ 0x6d + i ] );
          }
          sfn = sfn.replaceAll( ' ', '' ).toLowerCase();
          dfn = dfn.replaceAll( ' ', '' ).toLowerCase();
          emu.mon.cli.line( 'Sending linux file: ' + sfn );
          emu.mon.cli.line( 'to CP/M file: ' + dfn );
          this.state.port44sfile = 'cpm/files/' + sfn;
          this.state.port44dfile = dfn;
          this.state.port44data = fs.readFileSync( this.state.port44sfile );
          emu.mon.cli.line( this.state.port44data.length );
        }
        if ( this.state.port44started ) {
          var ptr = this.state.port44record * 0x80;
          if ( this.state.port44data.length > ptr ) {
            var rec = this.state.port44data.slice( ptr, ptr + 0x80 );
            for ( let i = 0; i < 0x80; i++ ) {
              if ( i >= rec.length ) {
                this.cpu.mem[ 0x80 + i ] = 0x00;
              } else {
                this.cpu.mem[ 0x80 + i ] = rec[ i ];
              }
            }
            emu.mon.cli.write( '.' );
            this.state.port44record++;
            return this.state.port44record;
          } else {
            this.state.port44started = false;
            emu.mon.cli.write( ' done' );
          }
        }
        return 0xff;
        break;
    }
    return 0x1a; // Ctrl-Z to simulate EOF
  }
  output( port, value ) {
    if ( port > 2 ) {
      //console.log( 'port out: ' + port + ' : ' + value );
    }
    let disks = [0,1,2,3,8,9];
    let disk;
    if ( disks.includes( this.drv ) ) {
      disk = this.disks[ this.drv ];
    } else {
      console.log( 'no disk ...' );
    }
    //this.co("output "+port+"="+value+":");
    switch (port) {
      case 1: // console out
        //this.co(String.fromCharCode(value));
        var ch = String.fromCharCode( value );
        if ( ch != '\u001a' ) {
          emu.mon.cli.write( ch );
        }
        break;
      case 3: // printer out
        //this.pr(String.fromCharCode(value));
        break;
      case 4: // rewind tape (aux)
        //if (value & 0x01) this.rewindTape();
        break;
      case 5: // aux out
        //this.puncher += String.fromCharCode(value);
        break;
      case 10: // 0x0a FDC drivea
        if ( value > 3 ) {
          //console.log( 'port: ' + value );
        }
        this.drv = value & 0xff;
        this.state.disk = this.disks[ this.drv ];
        //emu.disk = this.mon.disk; // to be removed
        break;
      case 11: // 0x0b FDC track
        this.trk = value & 0xff;
        break;
      case 12: // 0x0c FDC sector
        this.sec = value & 0xff;
        break;
      case 13: // 0x0d FDC command
        this.dskstatus = 0;
        if ( disk == null ) {
          console.log( 'disk errot 1: ' );
          this.dskstatus = 1; // illegal drive
          return null;
        }
        //if (this.trk >= this.drives[this.drv].tracks) {
        if ( this.trk >= disk.params.trks ) {
          console.log( 'disk errot 2: ' );
          this.dskstatus = 2; // illegal track
          return null;
        }
        //if (this.sec == 0 || this.sec > this.drives[this.drv].sectors) {
        if ( this.sec == 0 || this.sec > disk.params.secs ) {
          console.log( 'disk errot 3: ' + this.sec  );
          this.dskstatus = 3; // illegal sector
          return null;
        }
        if (value == 0) {        // read
          if (this.dma > this.cpu.mem.length - 128) {
            console.log( 'disk errot 5: ' );
            this.dskstatus = 5;  // read error
          } else {
            if ( this.cpuemu == 'cpu' ) {
              disk.secRead( 0, this.trk, this.sec, this.cpu.mem, this.dma );
            } else {
              disk.secRead( 0, this.trk, this.sec, this.mem, this.dma );
            }
            // dskstatus set by readSector
            this.dskstatus = 0;
          }
        } else if (value == 1) { // write
          if (this.dma > this.cpu.mem.length - 128) {
            console.log( 'disk errot 6: ' );
            this.dskstatus = 6;  // write error
          } else {
            if ( this.cpuemu == 'cpu' ) {
              disk.secWrite( 0, this.trk, this.sec, this.cpu.mem, this.dma );
            } else {
              disk.secWrite( 0, this.trk, this.sec, this.mem, this.dma );
            }
            //this.writeSector(this.drv, this.trk, this.sec, this.dma, this.dma + 128);
            // dskstatus set by writeSector
            this.dskstatus = 0;
          }
        } else {
            console.log( 'disk errot 7: ' );
            this.dskstatus = 7;    // illegal command
        }
        if ( this.sec > 25 ) {
          //console.log( 'read: ' );
        }
        break;
      case 15: // 0x0f DMA low
        this.dma = (this.dma & 0xff00) | (value & 0xff);
        break;
      case 16: // 0x10 DMA high
        this.dma = (this.dma & 0x00ff) | ((value & 0xff) << 8);
        break;
      case 0x42: // 0x42 send cmds to mon from cp/m
        this.port66 = 0xff;
        if ( value == 0x42 ) {
          let s, len;
          let cmd = '';
          let addr = 0x80; // length of arg string
          if ( this.cpuemu == 'cpu' ) {
            s = emu.hex.lines( this.cpu.mem, 0, 16, 16 );
            len = this.cpu.mem[ addr ] - 1; // don't include leading space in count
          } else {
            s = emu.hex.lines( this.cpu.mem, 0, 16, 16 );
            len = this.mem[ addr ] - 1; // don't include leading space in count
          }
          addr += 2; // move pointer past leading len and space
          for ( let i = 0; i < len; i++ ) {
            // getting the args
            let b;
            b = this.cpu.mem[ addr + i ];
            cmd += String.fromCharCode( b );
          }
          emu.mon.cli.line( 'mon exec: ' + cmd );
          // execute command in monitor
          emu.mon.cmd.exec( emu.mon.cli, cmd.toLowerCase() );
          emu.mon.cli.write( '\u001b[1A' ); // undo extra lf from cpm
          // signal command done
          this.port66 = 0x00;
        }
        break;
      case 0x43:
        if ( value != 0xff ) {
          if ( value == 0 ) {
            let sfn = '';
            let dfn = '';
            for ( let i = 0; i < 11; i++ ) {
              if ( i == 8 ) {
                sfn += '.';
                dfn += '.';
              }
              sfn += String.fromCharCode( this.cpu.mem[ 0x5d + i ] );
              dfn += String.fromCharCode( this.cpu.mem[ 0x6d + i ] );
            }
            sfn = sfn.replaceAll( ' ', '' ).toLowerCase();
            dfn = dfn.replaceAll( ' ', '' ).toLowerCase();
            dfn = 'cpm/files/' + dfn;
            emu.mon.cli.line( 'Receiving linux file: ' + dfn );
            emu.mon.cli.line( 'from CP/M file: ' + sfn );
            this.state.port43file = dfn;
            this.state.port43data = [];
          }
          for ( let i = 0; i < 0x80; i++ ) {
            this.state.port43data.push( this.cpu.mem[ 0x80 + i ] );
          }
          emu.mon.cli.write( '.' );
        } else {
          var buffer = Uint8Array.from( this.state.port43data );
          fs.writeFileSync( this.state.port43file, buffer );
          emu.mon.cli.write( ' done' );
        }
        break;
    }
    return null;
  }
  // ****************************************
  //
  // console io
  //
  // ****************************************
  key( key ) {
    switch ( key.name ) {
      case 'CR':
        key.str = '\n';
        break;
      case 'DEL':
        key.str = '\u0008';
        break;
      case 'SPACE':
        key.str = ' ';
        break;
      default:
        key.str = key.name;
        break;
    }
    this.inpQueue = this.inpQueue.concat( key.code );
  }
  // ****************************************
  //
  // Frames - Main System Loop
  //
  // *****
  frames() {
    this.ms = 15; // 15 is about 60 fps
    this.stepLoops = 8000; // 4000 = 250 kHz Cpu Clock
    this.stepBySteps = false; // false = step by ticks
    let self = this;
    let tstart, tframe, tio, tcpu;;
    let dframe = 0, dio = 0, dcpu = 0;
    let mframe = 0, mio = 0, mcpu = 0, msteps = 0, mticks = 0;
    this.state.tavg = {};
    let frames = 0;
    let beginning = performance.now();
    // Frame - Begins
    let interval = setInterval( function() {
      //
      // check waits
      //
      if ( self.cpu.state.coninwait ) {
        if ( self.inpQueue.length > 0 ) {
          var key = self.inpQueue[ 0 ];
          self.inpQueue = self.inpQueue.slice( 1 );
          var ch = key.charCodeAt( 0 );
          self.cpu.reg.a = ch;
          self.cpu.state.coninwait = false;
          self.cpu.state.running = true;
        }
      }
      //
      // do some cpu cycles
      //
      if ( self.cpu.state.running && self.cpu.state.on ) {
        let ticks = self.cpu.steps( self.stepLoops );
      }
      //
      //
      //
      frames++;
    }, this.ms );
    // Frame - Ends
  }
  // Frames - End
  screen() {
  }
  keyboard() {
  }
}

if ( typeof window !== 'object' ) {
  module.exports = EmuSys;
}

