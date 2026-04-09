//
// The main program for the emu system
//

const Cmd = require( './cmd/cmd.js' );

class Emu {
  constructor() {
    this.init();
  }
  init() {
    this.cmd = new Cmd();
  }
}

