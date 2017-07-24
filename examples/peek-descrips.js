#!/usr/bin/env node

// Simple example demonstrating use of the `peek` function.
// To use outside the source tree, replace require('..') with require('gelatin')

'use strict';

const util = require('util');
const peek = require('..').peek;

const pool = process.argv[2];

function main() {
  if (!pool) {
    console.error('pool argument required.');
    process.exitCode = 1;
    return;
  }

  const p = peek(process.argv[2]);

  // `peek()` returns a readable object stream.  The stream yields
  // `gelatin.Protein` objects.
  p.on('data', (protein) => {
    console.log('metabolized protein with descrips:', protein.descrips);
    // A `Protein` has descrips, just like in C++.  We assume that `descrips`
    // are a slaw list here, which is converted to a Javascript array.
    if (protein.descrips.indexOf('hangup') >= 0) {
      p.end();
    }
  });

  // Weaksauce error handling.
  p.on('error', (err) => {
    console.error(`peek error: ${util.inspect(err)}`);
  });

  console.log('now deposit/poke a protein to pool', process.argv[2]);
}

main();
