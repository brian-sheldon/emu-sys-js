
// Copyright (C) 2026 Brian Sheldon
//
// MIT License

if ( typeof window !== 'object' ) {
  //global.EmuTestSub = require( './emu.test.sub.js
}

class EmuMonCli {
  constructor() {
    log.debug( 'EmuMonCli constructed ...' );
    this.pos = 0;
    this.cmd = '';
    this._promptColor = '\u001b[1;35m';
    this._cmdColor = '\u001b[1;36m';
    this._baud = 0;
    this.ms = 8;
    this.queue = '';
    this.setInterval();
  }
  hi() {
    log.out( 'Hi from EmuMonCli ...' );
  }
  //
  // monitor cli io
  //
  // input for batch file processing
  promptColor( bright, color ) {
    color += 30;
    this._promptColor = '\u001b[' + bright +  ';' + color + 'm';
  }
  cmdColor( bright, color ) {
    color += 30;
    this._cmdColor = '\u001b[' + bright +  ';' + color + 'm';
  }
  get baud() {
    return this._baud;
  }
  set baud( baud ) {
    let cps = baud / 10;
    let cpi = cps * this.ms / 1009;
    this.ipc = Math.ceil( 1 / cpi );
    this.cpi = Math.ceil( cpi );
    this._baud = baud;
  }
  clearBaud( time = 0 ) {
    if ( time == 0 ) {
      this.baud = 0;
    } else {
      let self = this;
      setTimeout( function() {
        self.baud = 0;
      }, time );
    }
  }
  clearBaudDone() {
    let len = this.queue.length;
    let baud = this.baud;
    let cps = baud / 10;
    let ct = Math.round( 1000/ cps ) * len;
    this.clearBaud( ct );
  }
  setInterval() {
    let self = this;
    let count = 0;
    let mod = 1;
    let len, cpi, ipc;
    setInterval( function() {
      len = self.queue.length;
      cpi = self.cpi;
      ipc = self.ipc;
      if ( len > 0 ) {
        if ( self._baud == 0 ) {
          emu.io.write( self.queue );
          self.queue = '';
        } else {
          if ( ( count % ipc ) == 0 ) {
            cpi = Math.min( len, cpi );
            let s = self.queue.slice( 0, cpi );
            self.queue = self.queue.slice( cpi );
            emu.io.write( s );
          }
        }
      }
      count++;
    }, this.ms );
  }
  sleep( ms ) {
    return new Promise( resolve => setTimeout( resolve, ms ) );
  }
  async input( s ) {
    //this.begin();
    for ( let i = 0; i < s.length; i++ ) {
      await this.sleep( this._ms );
      let ch = s.charAt( i );
      if ( ch == '\n' ) {
        this.ctrl( 'CR' );
      } else {
        this.ins( ch );
      }
    }
  }
  // raw output
  async send( ch ) {
    await this.sleep( 200 );
    emu.io.write( ch );
  }
  write( s ) {
    this.queue += s;
  }
  // line output
  line( s ) {
    this.write( s + '\r\n' );
  }
  //
  // command line editor
  //
  begin() {
    this.write( this._promptColor + '>>> ' + this._cmdColor );
  }
  //get sub() {
    //return this._sub;
  //}
  cursorSave() {
    this.write( '\u001b[s' );
  }
  cursorUnsave() {
    this.write( '\u001b[u' );
  }
  cursorLeft( n ) {
    this.write( '\u001b[' + n + 'D' );
  }
  cursorRight( n ) {
    this.write( '\u001b[' + n + 'C' );
  }
  exec() {
    this.write( '\r\n' );
    emu.mon.cmd.exec( this, this.cmd );
    this.pos = 0;
    this.cmd = '';
    this.begin();
  }
  change() {
    this.write( '\r>>> ' + this.cmd + '\u001b[0K' );
  }
  ins( ch ) {
    let tail = this.cmd.slice( 0, this.pos );
    let head = this.cmd.slice( this.pos );
    let rlen = this.cmd.length - this.pos;
    if ( this.pos == this.cmd.length ) {
      // add to end
      this.cmd += ch;
      this.pos++;
    } else {
      this.cmd = tail + ch + head;
      this.pos++;
    }
    this.write( ch + head );
    if ( rlen > 0 ) {
      this.write( '\u001b[' + rlen + 'D' );
    }
  }
  bs() {
    if ( this.pos > 0 ) {
      this.cursorSave();
      let head = this.cmd.slice( this.pos );
      this.pos = this.pos > 0 ? this.pos - 1 : 0 ;
      let tail = this.cmd.slice( 0, this.pos );
      this.cmd = tail + head;
      this.change();
      this.cursorUnsave();
      this.cursorLeft( 1 );
    }
  }
  key( key ) {
    let ch = key.name;;
    let type = key.type;
    switch ( type ) {
      case 'char':
        this.ins( ch );
        break;
      case 'number':
        this.ins( ch );
        break;
      case 'punc':
        this.ins( ch );
        break;
      case 'space':
        this.ins( ' ' );
        break;
      case 'ctrl':
      case 'control':
      case 'delete':
        this.ctrl( ch );
        break;
    }
    //this.change();
  }
  ctrl( ch ) {
    switch ( ch ) {
      case 'CR':
        this.exec();
        break;
      case 'DEL':
        this.bs();
        break;
      case 'cursor-left':
        if ( this.pos > 0 ) {
          this.pos = this.pos > 0 ? this.pos - 1 : 0 ;
          this.cursorLeft( 1 );
        }
        break;
      case 'cursor-right':
        if ( this.pos < this.cmd.length ) {
          this.pos = this.pos < this.cmd.length ? this.pos + 1 : this.pos;
          this.cursorRight( 1 );
        }
        break;
    }
  }
}

if ( typeof window !== 'object' ) {
  module.exports = EmuMonCli;
}


