
const Hex = require( './hex.js' );
const NumInOut = require( './num.in.out.js' );

class CmdCalc {
  constructor() {
    this.words = [
      'dup','drop','swap','over','rot','nip','tuck',
      'and','or','xor','invert','8>>','8<<',
      '+','-','*','x','/','%','mod','/mod',
      'cr', 'sp', '.s',
      '.','.x','.o','.b',
      '..','..x','..o','..b'
    ];
    this.numio = new NumInOut();
    this._input = [ '1', '2', '+', 'dup', '.', '3', 'x', 'dup', '.' ];
    this.stack = [];
  }
  getStack() {
    let line = '[ ';
    for ( let i = 0; i < this.stack.length; i++ ) {
      let v = this.stack[i];
      line += '$' + hex0( v ) + ' ';
    }
    line += ']';
    return line;
  }
  push( v ) {
    this.stack.push( v );
    //this.showStack();
  }
  pop() {
    if ( this.stack.length > 0 ) {
      let v = this.stack.pop();
      return v;
    } else {
      console.log( '... stack empty ...' );
    }
  }
  len() {
    return this.stack.length;
  }
  at( i ) {
    let v = this.stack.at( i );
    if ( v === undefined ) {
      console.log( '... index out of stack range ...' );
    }
    return v;
  }
  splice( i ) {
    let v = this.at( i );
    if ( v !== undefined ) {
      this.stack.splice( i, 1 );
    }
    return v;
  }
  doCmd( cmd ) {
    let arr = cmd.split( ' ' );
    this.input( arr );
  }
  input( arr ) {
    this._input = arr;
    let t = this.calc();
    if ( t != '' ) {
      write( t + ' ' );
    }
    write( 'ok ' );
    writeline( this.getStack() );
  }
  writeValue( v, sp = '' ) {
    let s = v.toString() + sp;
    write( s );
  }
  writeValueSp( v ) {
    this.writeValue( v, ' ' );
  }
  calc() {
    for ( let i = 0; i < this._input.length; i++ ) {
      let len;
      let t, v, v1, v2, v3, res;
      let s = this._input[i];
      switch ( s ) {
        // words
        case 'words':
          len = this.words.length;
          for ( let i = len - 1; i >= 0; i-- ) {
            let word = this.words[i];
            write( word + ' ' );
          }
          writeline();
          break;
        // stack info
        case 'depth':
          v = this.len();
          this.push( v );
          break;
        case '.s':
          t = this.getStack();
          write( t + ' ' );
          break;
        // stack manipulation
        case 'dup':
          v = this.pop();
          this.push( v );
          this.push( v );
          break;
        case 'drop':
          this.pop();
          break;
        case 'swap':
          v2 = this.pop();
          v1 = this.pop();
          this.push( v2 );
          this.push( v1 );
          break;
        case 'over':
          v2 = this.at( -2 );
          if ( v2 !== undefined ) {
            this.push( v2 );
          }
          break;
        case 'rot':
          v3 = this.splice( -3 );
          if ( v3 !== undefined ) {
            this.push( v3 );
          }
          break;
        case 'nip':
          this.splice( -2 );
          break;
        case 'tuck':
          v1 = this.pop();
          v2 = this.pop();
          this.push( v1 );
          this.push( v2 );
          this.push( v1 );
          break;
        // print
        case '.':
          v = this.pop();
          write( dec0( v ) + ' ' );
          break;
        case '..':  // dup and return
          v = this.at( - 1 );
          write( dec0( v ) + ' ' );
          break;
        case 'cr':
          write( '\n' );
          break;
        case 'sp':
          write( ' ' );
          break;
        case '.x':
          v = this.pop();
          write( '$' + hex0( v ) + ' ' );
          break;
        case '.o':
          v = this.pop();
          write( '0o' + oct0( v ) + ' ' );
          break;
        case '.b':
          v = this.pop();
          write( '%' + bin0( v ) + ' ' );
          break;
        case '..x':
          v = this.at( -1 );
          write( '$' + hex0( v ) + ' ' );
          break;
        case '..o':
          v = this.at( -1 );
          write( '0o' + oct0( v ) + ' ' );
          break;
        case '..b':
          v = this.at( -1 );
          write( '%' + bin0( v ) + ' ' );
          break;
        case '+':
          v2 = this.pop();
          v1 = this.pop();
          res = v1 + v2;
          this.push( res );
          break;
        case '-':
          v2 = this.pop();
          v1 = this.pop();
          res = v1 - v2;
          this.push( res );
          break;
        case 'x':
        case '*':
          v2 = this.pop();
          v1 = this.pop();
          res = v1 * v2;
          this.push( res );
          break;
        case '/':
          v2 = this.pop();
          v1 = this.pop();
          res = Math.floor( v1 / v2 );
          this.push( res );
          break;
        case 'mod':
          v2 = this.pop();
          v1 = this.pop();
          res = v1 % v2;
          this.push( res );
          break;
        case '/mod':
          v2 = this.pop();
          v1 = this.pop();
          res = v1 % v2;
          this.push( res );
          res = Math.floor( v1 / v2 );
          this.push( res );
          break;
        case 'and':
          v2 = this.pop();
          v1 = this.pop();
          res = v1 & v2;
          this.push( res );
          break;
        case 'or':
          v2 = this.pop();
          v1 = this.pop();
          res = v1 | v2;
          this.push( res );
          break;
        case 'xor':
          v2 = this.pop();
          v1 = this.pop();
          res = v1 ^ v2;
          this.push( res );
          break;
        case 'invert':
          writeline( 'not implemented ...' );
          break;
        case '8>>':
          v1 = this.pop();
          res = v1 >> 8;
          this.push( res );
          break;
        case '8<<':
          v1 = this.pop();
          res = v1 << 8;
          this.push( res );
          break;
        default:
          v = this.numio.parse( s );
          if ( v == 'NaN' ) {
            console.log( s + ' is not a valid number ...' );
            return;
          } else {
            this.push( v );
          }
          break;
      }
    }
    return '';
  }
}

module.exports = CmdCalc;

