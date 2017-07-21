#!/usr/bin/env node

// A protein-spamming program which demonstrates the `depositor()` function.
// To use outside the source tree, replace require('..') with require('gelatin')

'use strict';

const Protein = require('..').Protein;
const depositor = require('..').depositor;
const util = require('util');

// Write the data to the supplied writable stream one million times.
// Be attentive to back-pressure.
function writeNTimes(n, writer, data, encoding, callback) {
  var i = n;
  write();
  function write() {
    var ok = true;
    do {
      i -= 1;
      if (i === 0) {
        // last time!
        writer.write(data(i), encoding, callback);
      } else {
        // see if we should continue, or wait
        // don't pass the callback, because we're not done yet.
        ok = writer.write(data(i), encoding);
      }
    } while (i > 0 && ok);
    if (i > 0) {
      // had to stop early!
      // write some more once it drains
      writer.once('drain', write);
    }
  }
}

function main() {
  // usage: `multipoke.js mypool 1000`
  const pool = process.argv[2];
  const n = Number(process.argv[3]) || 5;

  if (!pool) {
    console.error('pool argument required.');
    process.exitCode = 1;
    return;
  }

  // `depositor()` returns a writable object stream.  Write `gelatin.Protein`
  // to it and the stream will deposit them to the pool.
  const d = depositor(pool);
  d.on('error', (err) => {
    console.error(`depositor error: ${util.inspect(err)}`);
  });

  // `n` times, construct a protein and write it to the stream (deposit to the
  // pool) using the `writeNTimes` helper function.
  let j = 0;
  writeNTimes(n, d, (i) => {
    let map = new Map([['op', i]]);
    return new Protein(['hello' + i, 'world' + i++], map);
  }, null, () => {
    console.log(`all done -- ${n} proteins deposited.`);
    d.end();
  });
}

main();
