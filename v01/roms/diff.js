
let fs = require( 'fs' );

let f1 = 'forth.bin';
let f2 = 'forth2.bin';

if ( process.argv.length == 4 ) {
  f1 = process.argv[2];
  f2 = process.argv[3];
}

let d1 = fs.readFileSync( f1 );
let d2 = fs.readFileSync( f2 );

let count = 0;
let last = 0;
let addr;
let j = 0;
for ( let i = 0; i < d2.length; i++) {
  addr = i;
  let addrs = addr.toString( 16 ).padStart( 4, '0' );
  let b1 = d1[ i ];
  let b2 = d2[ j ];
  let b1s = b1.toString( 16 ).padStart( 2, '0' );
  let b2s = b2.toString( 16 ).padStart( 2, '0' );
  if ( b1 != b2 ) {
    count++;
    if ( addr != last + 1 ) {
      console.log();
    }
    console.log( count, addrs, b1s, b2s );
    last = addr;
  }
  //let diff = b1 != b2 ? ' *****' : '' ;
  //while ( ( b1 = d1[ j ] ) != b2 ) {
    //j++;
  //}
  j++;
}


