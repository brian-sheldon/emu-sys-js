
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

