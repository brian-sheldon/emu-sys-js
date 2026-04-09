
const fs = require( 'fs' );

let path = 'model1.rom';
if ( process.argv.length > 2 ) {
  path = process.argv[2];
}

console.log( path );

let data = fs.readFileSync( path );

let chksums = [
  [ 'Model 1 Level I',  'v1.0', '5A51', '9F9A' ],
  [ 'Model 1 Level I',  'v2.0', '5D0C', '99C2' ],
  [ 'Model 1 Level II', 'v1.0', 'AE5D', 'DA84', '4002' ],
  [ 'Model 1 Level II', 'v1.1', 'AE60', 'DA45', '3E3E' ],
  [ 'Model 1 Level II', 'v1.1', 'AE60', 'DA45', '40E0' ],
  [ 'Model 1 Level II', 'v1.2', 'AE60', 'DA45', '40BA' ],
  [ 'Model 1 Level Ii', 'v1.3', 'B078', 'DA45', '4006' ]
];

let patches = [
  [ 'v1.0', 'v1.1', '0683', '20EF', '20F1' ],
  [ 'v1.0', 'v1.1', '02E2', '2320EC', '20ED23' ],
  [ 'v1.0', 'v1.1', '1226', 'EA3412', '300B' ],
  [ 'v1.0', 'v1.1', '124C', '', 'B7' ],
  [ 'v1.0', 'v1.1', '1265', 'F24412', 'F24312' ],
  [ 'v1.0', 'v1.1', '2FFB', '0000', 'DE00' ]
];

function chksum() {
  let last = 0;
  let start = 0;
  let inc = 2048;
  while ( ( start * inc ) < data.length ) {
    let chksum = 0;
    for ( let b = 0; b < inc; b++ ) {
      let addr = start * inc + b;
      let byt = data[addr];
      chksum += byt;
    }
    chksum = chksum & 0xffff;
    chksumHex = chksum.toString( 16 ).padStart( 4, '0' );
    process.stdout.write( chksumHex + ' : ' );
    if ( ( start % 2 ) == 1 ) {
      let chksum2 = ( last + chksum ) & 0xffff;
      let chksum2Hex = chksum2.toString( 16 ).padStart( 4, '0' );
      console.log( chksum2Hex );
      last = 0;
    } else {
      last = chksum;
    }
    start++;
  }
}

chksum();

let versions = [
  'model1.level1.v1.0',
  'model1.level2.v1.0',
  'model1.level2.v1.1a',
  'model1.level2.v1.1b',
  'model1.level2.v1.2',
  'model1.level2.v1.3',
  'model1.level2.v1.3.patched',
  'diagnostic'
];

function split() {
  let version = 0;
  let start = 0;
  let inc = 8192;
  let data0 = fs.readFileSync( 'rom_a_8.bin' );
  let data1 = fs.readFileSync( 'rom_b_8.bin' );
  let p0 = data0.slice( start, start + 4096 );
  let p1 = data1.slice( start, start + 0 );
  let rom = Buffer.from( p0 );
  let path = versions[version] + '.rom';
  console.log( start, path );
  fs.writeFileSync( path, rom );
  for ( let i = 0; i < 6; i++ ) {
    version++;
    start += inc;
    p0 = data0.slice( start, start + 8192 );
    p1 = data1.slice( start, start + 4096 );
    rom = Buffer.from( [ ...p0, ...p1 ] );
    path = versions[version] + '.rom';
    console.log( start, path );
    fs.writeFileSync( path, rom );
  }
  version++;
  start += inc;
  p0 = data0.slice( start, start + 0x522 );
  rom = Buffer.from( p0 );
  path = versions[version] + '.rom';
  console.log( start, path );
  fs.writeFileSync( path, rom );
}

//split();


