#!/usr/bin/env node

// Reads proteins from a wands pool, sifts wand reports for a wand of interest
// and deposits wand reports for just that wand to an output pool.

'use strict';

const util = require('util');
const gelatin = require('..');
const Protein = gelatin.Protein;
const depositor = gelatin.depositor;
const peek = gelatin.peek;
const Slaw = gelatin.Slaw;

const inputPool = process.argv[2];
const outputPool = process.argv[3];
const wandName = process.argv[4];

// Helper function for performing a "map merge" on two ES6 Map objects.
function mapMerge(map1, map2) {
  const m = new Map(map1);
  for (const kv of map2) {
    m.set(kv[0], kv[1]);
  }
  return m;
}

function main() {
  if (!inputPool || !outputPool) {
    console.error('usage: wandsplit <INPUT_POOL> <OUTPUT_POOL> <WAND_NAME>');
    console.error('pool arguments required (input and output).');
    process.exitCode = 1;
    return;
  }

  // Open a protein stream object which streams proteins from the `inputPool`
  // pool.
  const input = peek(inputPool);
  // Open a protein stream object which streams proteins written to its input
  // to the `outputPool` pool.
  const output = depositor(outputPool);

  // Upon receipt of a protein from the input pool:
  input.on('data', (protein) => {
    const ingests = protein.ingests;
    const report = ingests.get('wand-report');
    let newReport;
    // Look for the wand of interest
    for (let wand of report) {
      if (wand.get('name') === wandName) {
        newReport = [wand];
        break;
      }
    }

    if (newReport) {
      // If the wand of interest was found, map-merge a new wand report
      // containing only that wand with the original ingests map.
      const newIngests = mapMerge(ingests,
                                  new Map([['wand-report', newReport]]));
      output.write(new Protein(protein.descrips, newIngests));
    } else {
      console.error(`wand named ${wandName} was not found in wand-report:`,
                    report);
    }
  });

  // Some weaksauce error handling.
  input.on('error', (err) => {
    console.error(`peek error: ${util.inspect(err)}` +
                  `${err.stack}`);
  });
  output.on('error', (err) => {
    console.error(`poke error: ${util.inspect(err)}`);
  });
}

main();
