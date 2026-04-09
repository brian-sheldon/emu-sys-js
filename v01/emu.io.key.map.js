
if ( typeof window !== 'object' ) {
  //global.EmuMonCli = require( './emu.mon.cli.js
  global.EmuIoKeyMapJson = require( './emu.io.key.map.json' );
}

class EmuIoKeyMap {
  constructor() {
    log.debug( 'EmuIoKeyMap constructed ...' );
    //this.cli = new EmuMonCli();
  }
  hi() {
    log.out( 'Hi from EmuIoKeyMap ...' );
  }
  get sub() {
    //return this._sub;
  }
  init() {
    let self = this;
    if ( emu.env == 'node' ) {
      this.data = EmuIoKeyMapJson;
    } else {
      $.getJSON( './emu.io.key.map.json', function(data) {
      }).done( function( data ) {
        self.data = data;
        log.debug( 'EmuIoKeyMapJson loaded ...' );
      }).fail( function() {
        log.debug( 'EmuIoKeyMapJson failed ***' );
      });
    }
  }
  map( ca ) {
    let sep = '';
    let hex = 'hex';
    for ( let ch of ca ) {
      let code = ch.charCodeAt(0);
      hex += sep + emu.hex.b( code );
      sep = '-';
    }
    let res = this.data[ hex ];
    let name = res ? res[0] : 'not in table ...';
    let type = res ? res[1] : 'not in table ...';
    let desc = res ? res[2] : 'not in table ...';
    return res;
  }
  key( ca ) {
    let o = {};
    o.type = '';
    o.name = '';
    o.desc = '';
    let key = this.map( ca );
    if ( key ) {
      o.type = key[ 1 ];
      o.name = key[ 0 ];
      o.desc = key[ 2 ];
    }
    return o;
  }
}

if ( typeof window !== 'object' ) {
  module.exports = EmuIoKeyMap;
}

