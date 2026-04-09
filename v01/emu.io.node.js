
if ( typeof window !== 'object' ) {
  //global.EmuTestSub = require( './emu.test.sub.js
}

class EmuIoNode {
  constructor() {
    log.debug( 'EmuIoNode constructed ...' );
  }
  hi() {
    log.out( 'Hi from EmuIoNode ...' );
  }
  start( io ) {
    this.io = io;
    this.lf = '\n';
    process.stdin.setRawMode( true );
    process.stdin.resume();
    process.stdin.setEncoding( 'utf8' );
    //io.write( '\u001b[1;33;40m' );
    this.listen( io );
  }
  listen( io ) {
    let lf = this.lf;
    process.stdin.on(
      'data', function( ca ) {
        if ( ca === '\u0004' ) {
          io.write( 'ctrl-d pressed: exiting ...' );
          io.write( lf );
          io.write( '\u001b[1;37;40m' );
          process.exit();
        }
        io.key( ca );
      } 
    );
  }
  write( s ) {
    // for tracing
    //process.stdout.write( '#' );
    process.stdout.write( s );
  }
  keyCodeOut( ca ) {
    let sep = '';
    let lf = this.lf;
    let out = process.stdout;
    let len = ca.length;
    for ( let ch of ca ) {
      let code = ch.charCodeAt(0);
      codehex = code <= 0xff ? emu.hex.b( code ) : emu.hex.w( code ) ;
      this.io.write( sep + codehex );
      sep = '-';
    }
  }
}



if ( typeof window !== 'object' ) {
  module.exports = EmuIoNode;
}
