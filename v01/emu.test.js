
// Copyright (C) 2026 Brian Sheldon
//
// MIT License

if ( typeof window !== 'object' ) {
  global.EmuTestSub = require( './emu.test.sub.js' );
}

class EmuTest {
  constructor() {
    log.debug( 'EmuTest constructed ...' );
    this._sub = new EmuTestSub();
  }
  hi() {
    log.out( 'Hi from EmuTest ...' );
  }
  get sub() {
    return this._sub;
  }
  init() {
  }
}

if ( typeof window !== 'object' ) {
  module.exports = EmuTest;
}

