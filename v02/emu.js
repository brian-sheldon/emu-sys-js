
// Copyright (C) 2026 Brian Sheldon
//
// MIT License

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

