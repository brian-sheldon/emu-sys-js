
class Cmd {
  constructor() {
    this.paused = false;
    this.keyQueue = [];
    this._prompt = '>>> ';
    this.line( '--- ctrl-d or "bye" to exit ---' );
    this.write( this._prompt );
    this.queue = '';
    this.history = [];
    this.historypos = 0;
    this.historysavedcmd = '';
    this.cmd = '';
    this.cmdpos = 0;
    this.addKeyEvent( this );
  }
  hex2( v ) {
    return v.toString( 16 ).padStart( 2, '0' );
  }
  get prompt() {
    return this._prompt;
  }
  set prompt( s ) {
    this._prompt = s;
  }
  addKeyEvent( io ) {
    process.stdin.setRawMode( true );
    process.stdin.resume();
    process.stdin.setEncoding( 'utf8' );
    process.stdin.on( 'data', function( key ) {
      if ( key === '\x04' ) {
        io.line();
        io.line( 'Key: ctrl-d ... exiting ...' );
        process.exit();
      }
      if ( this.paused ) {
        this.keyQueue.push( key );
      } else {
        io.key( io, key );
      }
    });
  }
  pause() {
    this.paused = true;
  }
  resume( io = this ) {
    for ( let k in io.keyQueue ) {
      let key = io.keyQueue.pop();
      io.key( io, key );
    }
    io.paused = false;
  }
  write( s = '' ) {
    if ( this.paused ) {
      this.keyQueue.push( s );
    } else {
      process.stdout.write( s );
    }
  }
  line( s = '' ) {
    let lf = '\n';
    this.write( s + lf );
  }
  key( io, key ) {
    let len = key.length;
    let hexstr = '';
    for ( let c in key ) {
      let ch = key[ c ];
      let cc = ch.charCodeAt( 0 );
      hexstr += this.hex2( cc );
    }
    this.show = false;
    if ( this.show ) {
      io.write( len + ' ' );
      io.line( hexstr );
    }
    this.doKey( io, key, len, hexstr );
  }
  doKey( io, key, len, hexstr ) {
    let cc, ch;
    switch ( hexstr ) {
      case '0d': // Enter
        io.line();
        if ( this.cmd != this.history[ this.history.length - 1 ] ) {
          this.history.push( this.cmd );
        }
        this.historypos = this.history.length;
        this.historysavedcmd = '';
        this.doCmd( io, this.cmd );
        this.cmd = '';
        this.cmdpos = 0;
        break;
      case '7f': // Backspace
        if ( this.cmdpos > 0 ) {
          var right = this.cmd.slice( this.cmdpos );
          this.cmdpos--;
          var left = this.cmd.slice( 0, this.cmdpos );
          this.cmd = left + right;
          io.write( '\x1b[D\x1b[s' );
          io.write( '' + right + ' ' );
          io.write( '\x1b[u' );
        }
        break;
      case '1b5b44': // left
        if ( this.cmdpos > 0 ) {
          this.cmdpos--;
          io.write( '\x1b[D' );
        }
        break;
      case '1b5b43': // right
        if ( this.cmdpos < this.cmd.length ) {
          this.cmdpos++;
          io.write( '\x1b[C' );
        }
        break;
      case '1b5b41': // up
        if ( this.historypos > 0 ) {
          if ( this.historypos == this.history.length ) {
            this.historysavedcmd = this.cmd;
          }
          this.cmd = this.history[ this.historypos - 1 ];
          this.write( '\r' );
          io.write( this.prompt );
          io.write( this.cmd );
          this.cmdpos = this.cmd.length;
          io.write( '\x1b[K' );
          this.historypos--;
        }
        break;
      case '1b5b42': // down
        var update = false;
        if ( this.historypos < this.history.length - 1 ) {
          this.cmd = this.history[ this.historypos + 1 ];
          update = true;
        } else {
          if ( this.historypos == this.history.length - 1 ) {
            this.cmd = this.historysavedcmd;
            update = true;
          }
        }
        if ( update ) {
          this.write( '\r' );
          io.write( this.prompt );
          io.write( this.cmd );
          this.cmdpos = this.cmd.length;
          io.write( '\x1b[K' );
          this.historypos++;
        }
        break;
      default:
        if ( len == 1 ) {
          cc = key.charCodeAt( 0 );
          ch = key.charAt( 0 );
          if ( cc < 0x20 ) {
            this.doCmd( io, hexstr, true );
          } else {
            var right = this.cmd.slice( this.cmdpos );
            var left = this.cmd.slice( 0, this.cmdpos );
            this.cmdpos++;
            this.cmd = left + ch + right;
            //this.cmd += ch;
            //this.cmdpos++;
            io.write( ch );
            if ( right.length > 0 ) {
              io.write( '\x1b[s' );
              io.write( right );
              io.write( '\x1b[u' );
            }
          }
        } else {
          this.doCmd( io, hexstr, true );
        }
        break;
    }
  }
  doCmd( io, cmd, key = false ) {
    cmd = cmd.trim().replace( /\s+/g, ' ' );
    let args = cmd.split( ' ' );
    let plen = args.length;
    let p0 = plen > 0 ? args[ 0 ] : '' ;
    let p1 = plen > 1 ? args[ 1 ] : '' ;
    let p2 = plen > 2 ? args[ 2 ] : '' ;
    let p3 = plen > 3 ? args[ 3 ] : '' ;
    let p4 = plen > 4 ? args[ 4 ] : '' ;
    switch ( p0 ) {
      case 'bye':
        io.line( 'Command: bye ... existing ...' );
        process.exit();
        break;
      case 'input':
        break;
      default:
        let res = 1;
        //if ( this.cmd != null ) {
          //res = this.ext.doCmd( this.m, io, cmd );
        //}
        if ( res == 1 ) {
          if ( cmd != '' ) {
            if ( key ) {
              io.line();
              io.line( 'Key: ' + p0  + ' ... not recognized ... ' );
              io.write( this.prompt );
            } else {
              io.line( 'Cmd: ' + p0  + ' ... not recognized ... ' );
              io.write( this.prompt );
            }
          } else {
            io.write( this.prompt );
          }
          //io.line( 'Enter help for instructions ...' );
        }
        if ( res != 2 ) {
        }
        break;
    }
  }
}

let cmd = new Cmd();

module.exports = Cmd;

