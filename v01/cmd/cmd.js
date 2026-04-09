
// Copyright (C) 2026 Brian Sheldon
//
// MIT License

if ( typeof window !== 'object' ) {
  global.EmuCmdDisk = require( './cmd.disk.js' );
  global.EmuCmdSys = require( './cmd.sys.js' );
}

class EmuCmd {
  constructor( mon ) {
    log.debug( 'EmuCmd constructed ...' );
    this._mon = mon;
    this._disk = new EmuCmdDisk( mon );
    this._sys = new EmuCmdSys( mon );
    this.init();
    this.rulerWidth = 60;
    this.rulerFives = '+';
    this.rulerOn = false;
  }
  hi() {
    log.out( 'Hi from EmuCmd ...' );
  }
  get disk() {
    return this._disk;
  }
  get sys() {
    return this._sys;
  }
  init() {
    this.defCmd = '';
  }
  ruler() {
    let fives = this.rulerFives;
    let width = this.rulerWidth;
    let i = 1;
    let str = '';
    while ( i < width + 1 ) {
      if ( ( i % 10 ) == 0 ) {
        str += ( i / 10 ) % 10;
      } else {
        if ( ( i % 5 ) == 0 ) {
          str += fives;
        } else {
          str += '.';
        }
      }
      i++;
    }
    return str;
  }
  exec( io, cmd ) {
    cmd = cmd.trim();
    let parms = cmd.split( ' ' );
    let plen = parms.length;
    let p0 = plen > 0 ? parms[0] : '' ;
    let p1 = plen > 1 ? parms[1] : '' ;
    let p2 = plen > 2 ? parms[2] : '' ;
    let p3 = plen > 3 ? parms[3] : '' ;
    let res;
    let repeat = cmd == '';
    cmd = repeat ? this.defCmd : cmd ;
    if ( this.rulerOn && cmd != '' ) {
      io.line( this.ruler() );
    }
    //io.line( 'executing ... ' + cmd );
    res = emu.mon.cmd.disk.exec( io, cmd );
    this.defCmd = res != '' ? res : this.defCmd ;
    res = emu.mon.cmd.sys.exec( io, cmd, repeat );
    this.defCmd = res != '' ? res : this.defCmd ;
    switch ( p0 ) {
      case 'ruler':
        if ( plen > 1 ) {
          this.rulerWidth = parseInt( p1 );
        }
        if ( plen > 2 ) {
          this.rulerFives = p2;
        }
        io.line( this.ruler() );
        break;
      case 'ruleron':
        this.rulerOn = true;
        break;
      case 'ruleroff':
        this.rulerOn = false;
        break;
      case 'clrcmd':
        this.defCmd = '';
      case 'defcmd':
        io.line( 'Current default cmd: ' + this.defCmd );
        break;
      case 'baud':
        if ( plen > 1 ) {
          io.baud = parseInt( p1 );
        }
        if ( plen > 2 ) {
          if ( p2 != 'silent' ) {
            io.line( 'baud: ' + io.baud );
          }
        }
        break;
      case 'msg':
        if ( plen > 1 ) {
          let msg = parms.slice( 1 ).join( ' ' );
          io.line( msg );
        }
        break;
      case '<':
      case 'trip':
        if ( plen > 1 ) {
          let fn = 'trip.' + p1 + '.txt';
          if ( fs.existsSync( fn ) ) {
            //io.line( 'file exists ...' );
            let s = fs.readFileSync( fn, 'utf8' );
            let lines = s.split( '\n' );
            lines = lines.slice( 0, -1 );
            for ( let l in lines ) {
              let line = lines[ l ];
            }
            let l = 0;
            let delay = 20;
            let loops = 1;
            lines.push( '10 \n\u001b[2K\rthis trip is done ...' );
            lines.push( '10 baud 0' );
            let loop = setInterval( function() {
              if ( ( loops % delay ) == 0 ) {
                if ( l < lines.length ) {
                  let line = lines[ l++ ];
                  let parts = line.split( ' ' );
                  delay = parts[0];
                  let cmd;
                  if ( parts[ 1 ] == 'hide' ) {
                    cmd = parts.slice( 2 ).join( ' ' );
                    io.write( '\n' );
                    emu.mon.cmd.exec( io, cmd );
                    io.begin();
                  } else {
                    cmd = parts.slice( 1 ).join( ' ' );
                    io.input( cmd + '\n' );
                  }
                  //io.line( cmd );
                  loops = 1;
                } else {
                  io.input( '\n' );
                  clearInterval( loop );
                }
              }
              loops++;
            }, 100 );
          } else {
            io.line( 'file does not exist ...' );
          }
        }
        var s = '';
        s += 'defcmd\n';
        s += 'zz\n';
        s += 'b\n';
        s += 'bt\n';
        //io.line( 'testing batch  piped to io input ...' );
        //io.input( s );
        break;
      case 'colors':
        for ( let bright = 0; bright < 2; bright++ ) {
          for ( let color = 0; color < 8; color++ ) {
            io.line( '\u001b[' + bright + ';' + ( 30 + color ) + 'mBright: ' + bright + ' Color: ' + color );
          }
        }
        break;
      case 'color':
        if ( plen == 3 ) {
          var bright = parseInt( p1 );
          var color = parseInt( p2 );
          emu.mon.cli.cmdColor( p1, p2 );
          //io.line( '\u001b[' + bright + ';' + ( 30 + color ) + 'mBright: ' + bright + ' Color: ' + color );
        }
        break;
      case 'prompt':
        if ( plen == 3 ) {
          var bright = parseInt( p1 );
          var color = parseInt( p2 );
          emu.mon.cli.promptColor( p1, p2 );
        }
        break;
      case 'lessons':
        io.baud = 300;
        io.line( 'This is a test of a long line ...' );
        io.clearBaudDone();
        break;
      case 'lesson':
        if ( plen == 2 ) {
          var lesson = parseInt( p1 );
          var file = 'lessons/lesson.' + lesson + '.txt';
          if ( fs.existsSync( file ) ) {
            let s = fs.readFileSync( file, 'utf8' );
            io.baud = 1200;
            io.write( s );
            io.clearBaudDone();
            /*
            let lines = s.split( '\n' );
            var len = lines.length;
            var l = 0;
            var loop = setInterval( function() {
              var line = lines[ l++ ];
              io.line( line );
              len--;
              if ( len == 0 ) {
                clearInterval( loop );
              }
              io.baud = 0;
            }, 100 );
            */
          }
        }
        break;
      case 'bye':
        io.line( 'bye: exiting ...' );
        io.line( '\u001b[1;37;40m' );
        setTimeout( function() {
          process.exit();
        }, 2000 );
        break;
    }
    if ( this.rulerOn && cmd != '' ) {
      io.line( this.ruler() );
    }
  }
}

if ( typeof window !== 'object' ) {
  module.exports = EmuCmd;
}


