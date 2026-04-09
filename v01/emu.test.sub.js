
// Copyright (C) 2026 Brian Sheldon
//
// MIT License

class EmuTestSub {
  constructor() {
    log.out( 'EmuTestSub constructed ...' );
  }
  hi() {
    log.out( 'Hi from EmuTestSub ...' );
  }
  init() {
  }
}

if ( typeof window !== 'object' ) {
  module.exports = EmuTestSub;
}

