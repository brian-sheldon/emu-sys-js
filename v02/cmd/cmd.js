
let IoNode = require( '../io/io.js' );


//let Hex = require( './hex' );
//let CmdMain = require( './cmd.main.js' );

let CmdCalc = require( './cmd.calc.js' );
let CmdFile = require( './cmd.file.js' );
let CmdDiskCpm = require( './cmd.disk.cpm.js' );
let CmdSys = require( './cmd.sys.js' );

//let CmdFileImgCpm = require( './cmd.file.img.cpm.js' );
//let CmdSys = require( './cmd.sys.js' );
//let CmdSysCpm = require( './cmd.sys.cpm.js' );
//let CmdSysTrs = require( './cmd.sys.trs.js' );
//let CmdSys68k = require( './cmd.sys.68k.js' );


function initCmd() {
  if ( true ) {
    let cmd = new Cmd();
  }
}

let cmdModes = [
  'm-', // prompt + '>'
  'c-hex',
  'c-dec',
  'c-oct',
  'c-bin',
  'f-', // prompt = this + truncated filename
  'f-img-cpm',
  'f-sys' // 
];

class Cmd {
  constructor() {
    this.words = [
      'ctrl-d','bye','exit',
      'words',
      'main','calc','file','sys',
      'm-','c-','f-','s-',
    ];
    this.debug = false;
    // cmds
    this.calc = new CmdCalc();
    this.file = new CmdFile( this );
    this.cpm = new CmdDiskCpm( this );
    this.sys = new CmdSys( this );
    // io
    this.io = new IoNode( this );
    this.doKey = this.doKey.bind( this );
    this.io.keyCallback = this.doKey;
    //this._out = 'cmd'; // cmd or sys at this point
    // cmd
    this._mode = 'm-';
    this._prompt = '>>> ';
    // cmd line editing
    this.cmd = '';
    this.cmdpos = 0;
    // cmd history
    this.history = [];
    this.historypos = 0;
    this.historysavedcmd = '';
    // listen for keys
    //this.addKeyEvent( this );
    // Change to global write, writeline
    writeline( '--- ctrl-d or "bye" to exit ---' );
    write( this._prompt );
    this.defcmd = '';
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
  get mode() {
    return this._mode;
  }
  set mode( mode ) {
    this._mode = mode;
  }
  get defcmd() {
    return this._defcmd;
  }
  set defcmd( cmd ) {
    this._defcmd = cmd;
  }
  doKey( key, len, hexstr ) {
    let cc, ch;
    switch ( hexstr ) {
      case '0d': // Enter
        writeline();
        if ( this.cmd != this.history[ this.history.length - 1 ] ) {
          this.history.push( this.cmd );
        }
        this.historypos = this.history.length;
        this.historysavedcmd = '';
        this.doCmd( this.cmd );
        this.cmd = '';
        this.cmdpos = 0;
        break;
      case '7f': // Backspace
        if ( this.cmdpos > 0 ) {
          var right = this.cmd.slice( this.cmdpos );
          this.cmdpos--;
          var left = this.cmd.slice( 0, this.cmdpos );
          this.cmd = left + right;
          write( '\x1b[D\x1b[s' );
          write( '' + right + ' ' );
          write( '\x1b[u' );
        }
        break;
      case '1b5b44': // left
        if ( this.cmdpos > 0 ) {
          this.cmdpos--;
          write( '\x1b[D' );
        }
        break;
      case '1b5b43': // right
        if ( this.cmdpos < this.cmd.length ) {
          this.cmdpos++;
          write( '\x1b[C' );
        }
        break;
      case '1b5b41': // up
        if ( this.historypos > 0 ) {
          if ( this.historypos == this.history.length ) {
            this.historysavedcmd = this.cmd;
          }
          this.cmd = this.history[ this.historypos - 1 ];
          write( '\r' );
          write( this.prompt );
          write( this.cmd );
          this.cmdpos = this.cmd.length;
          write( '\x1b[K' );
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
          write( '\r' );
          write( this.prompt );
          write( this.cmd );
          this.cmdpos = this.cmd.length;
          write( '\x1b[K' );
          this.historypos++;
        }
        break;
      default:
        if ( len == 1 ) {
          cc = key.charCodeAt( 0 );
          ch = key.charAt( 0 );
          if ( cc < 0x20 ) {
            this.doCmd( hexstr, true );
          } else {
            var right = this.cmd.slice( this.cmdpos );
            var left = this.cmd.slice( 0, this.cmdpos );
            this.cmdpos++;
            this.cmd = left + ch + right;
            //this.cmd += ch;
            //this.cmdpos++;
            write( ch );
            if ( right.length > 0 ) {
              write( '\x1b[s' );
              write( right );
              write( '\x1b[u' );
            }
          }
        } else {
          this.doCmd( hexstr, true );
        }
        break;
    }
  }
  doCmd( cmd, key = false ) {
    if ( this.debug ) {
      writeline( 'cmd.doCmd ... ' + cmd );
    }
    cmd = cmd.trim().replace( /\s+/g, ' ' );
    if ( cmd == '' ) {
      cmd = this.defcmd;
    }
    let args = cmd.split( ' ' );
    let plen = args.length;
    let p0 = plen > 0 ? args[ 0 ] : '' ;
    let p1 = plen > 1 ? args[ 1 ] : '' ;
    let p2 = plen > 2 ? args[ 2 ] : '' ;
    let p3 = plen > 3 ? args[ 3 ] : '' ;
    let p4 = plen > 4 ? args[ 4 ] : '' ;
    let scmd = args.slice( 1 ).join( ' ' );
    if ( this.debug ) {
      writeline( 'args: ' + plen + ' : ' + args );
      writeline( 'scmd: ' + scmd );
    }
    let len;
    switch ( p0 ) {
      // main mode cmds
      case 'debugon':
        this.debug = true;
        break;
      case 'debugoff':
        this.debug = false;
        break;
      case 'main-words':
        len = this.words.length;
        for ( let i = len - 1; i >= 0; i-- ) {
          let word = this.words[i];
          write( word + ' ' );
        }
        writeline();
        break;
      case 'bye':
      case 'exit':
        writeline( 'Command: bye ... existing ...' );
        process.exit();
        break;
      // switch to main mode or one time if plen > 1
      case 'm-':
      case 'main':
        if ( plen == 1 ) {
          this.mode = 'm-';
          this.prompt = '>>> ';
        } else {
          this.doCmd( scmd );
        }
        break;
      // switch to calc mode or one time if plen > 1
      case 'c-':
      case 'calc':
        if ( plen == 1 ) {
          this.mode = 'c-';
          this.prompt = this.mode + '> ';
        } else {
          this.calc.doCmd( scmd );
        }
        break;
      // switch to file mode or one time if plen > 1
      case 'f-':
      case 'file':
        if ( plen == 1 ) {
          this.mode = 'f-';
          this.prompt = this.mode + '> ';
        } else {
          this.file.doCmd( scmd );
        }
        break;
      // switch to cpm disk img mode or one time if plen > 1
      case 'd-cpm-':
      case 'd-cpm':
        if ( plen == 1 ) {
          this.mode = 'd-cpm-';
          this.prompt = this.mode + '> ';
        } else {
          this.cpm.doCmd( scmd );
        }
        break;
      // switch to trs img mode or one time if plen > 1
      case 'd-trs-':
      case 'd-trs':
        if ( plen == 1 ) {
          this.mode = 'd-trs-';
          this.prompt = this.mode + '> ';
        } else {
          //this.trs.doCmd( scmd );
        }
        break;
      // switch to sys mode or one time if plen > 1
      case 's-':
      case 'sys':
        if ( plen == 1 ) {
          this.mode = 's-';
          this.prompt = this.mode + '> ';
        } else {
          this.sys.doCmd( scmd );
        }
        break;
      default:
        let res = 1;
        if ( res == 1 ) {
          if ( cmd != '' ) {
            if ( key ) {
              writeline();
              writeline( 'Key: ' + p0  + ' ... not recognized ... ' );
              //write( this.prompt );
            } else {
              if ( this.mode != 'm-' ) {
                this.doCmd( this.mode + ' ' + cmd );
              } else {
                writeline( 'Cmd: ' + p0  + ' ... not recognized ... ' );
              }
              //write( this.prompt );
            }
          } else {
            //write( this.prompt );
          }
          //io.line( 'Enter help for instructions ...' );
        }
        if ( res != 2 ) {
        }
        break;
    }
    write( '\r' + this.prompt );
  }
}

initCmd();

module.exports = Cmd;

