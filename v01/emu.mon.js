
if ( typeof window !== 'object' ) {
  global.EmuMonCli = require( './emu.mon.cli.js' );
  global.EmuCmd = require( './cmd/cmd.js' );
}

class EmuMon {
  constructor() {
    log.debug( 'EmuMon constructed ...' );
    this._cli = new EmuMonCli();
    this._cmd = new EmuCmd( this );;
  }
  hi() {
    log.out( 'Hi from EmuMon ...' );
  }
  get cli() {
    return this._cli;
  }
  get cmd() {
    return this._cmd;
  }
  /*
  get state() {
    return this._state;
  }
  get addr() {
    return this._addr;
  }
  set addr( addr ) {
    this._addr = addr;
  }
  get sys() {
    return this._sys;
  }
  set sys( sys ) {
    this._sys = sys;
  }
  get disk() {
    return this._disk;
  }
  set disk( disk ) {
    this._disk = disk;
  }
  */
  init() {
  }
}

if ( typeof window !== 'object' ) {
  module.exports = EmuMon;
}

