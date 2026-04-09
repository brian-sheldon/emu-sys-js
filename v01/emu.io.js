
if ( typeof window !== 'object' ) {
  global.EmuIoNode = require( './emu.io.node.js' );
  global.EmuIoKeyMap = require( './emu.io.key.map.js' );
}

class EmuIo {
  constructor() {
    log.debug( 'EmuIo constructed ...' );
    this.session = '';
    if ( emu.env == 'node' ) {
      fs.writeFileSync( 'ses.log', this.session, 'utf8' );
    }
  }
  hi() {
    log.out( 'Hi from EmuIo ...' );
  }
  get console() {
    return this._console;
  }
  get dst() {
    return this._dst;
  }
  set dst( dst ) {
    this._dst = dst;
  }
  init() {
    log.debug( 'EmuIo init() ...' );
    log.debug( 'EmuIo env: ' + emu.env + ' ...' );
    this._dst = 'mon';
    switch ( emu.env ) {
      case 'node':
        this._console = new EmuIoNode();
        this.console.start( this );
        //this.io.out = new EmuNodeOut();
        //this.io.fs = new EmuNodeFS();
        break;
      case 'browser':
      case 'webview':
        this._console = new EmuIoXterm();
        this.console.start( this );
        break;
      default:
        log.fatal( 'Environment not supported ...' );
        break;
    }
    this.keymap = new EmuIoKeyMap();
    this.keymap.init();
    log.ioReady( this );
    log.debug( 'output redirected to EmuIo ...' );
  }
  //
  // Input Callback
  // - redirects input as needed
  //
  // echo for testing
  key( ca ) {
    let key = this.keymap.key( ca );
    key.code = ca;
    if ( key.name == 'page-down' ) {
      this.dst = 'mon';
      this.line();
      this.line( 'keyboard connected to monitor ...' );
      return;
    }
    if ( key.name == 'page-up' ) {
      this.dst = 'sys';
      this.line();
      this.line( 'keyboard connected to system ...' );
      return;
    }
    switch ( this.dst ) {
      case 'mon':
        emu.mon.cli.key( key );
        break;
      case 'sys':
        emu.sys.key( key );
        break;
    }
    //this.write( key.type + ' : ' + key.name + '\r\n' );
  }
  write( s ) {
    switch ( emu.env ) {
      case 'node':
        this.console.write( s );
        this.session += s;
        if ( true ) {
          fs.appendFileSync( 'ses.log', this.session, 'utf8' );
          this.session = '';
        }
        break;
      case 'browser':
        this.console.write( s );
        break;
    }
  }
  line( s = '' ) {
    this.write( s + '\r\n' );
  }
}

if ( typeof window !== 'object' ) {
  module.exports = EmuIo;
}

