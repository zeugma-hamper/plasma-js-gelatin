#!/usr/bin/env node

// Executes each compat module function on a pool of choice.

'use strict';

// argv[1] is always the script name.
const POOL = process.argv[2];
if (!POOL || POOL === '') {
  console.error(`usage: p-info.js POOL`);
  process.exit(1);
}

// require('gelatin/compat')
const compat = require('../lib/compat');

compat.oldestIndex(POOL, function(index) {
  console.log('oldest index', index);
  compat.newestIndex(POOL, function(index) {
    console.log('newest index', index);
    compat.oldest(POOL, function(protein) {
      console.log('oldest', protein);
      compat.newest(POOL, function(protein) {
        console.log('newest', protein);
      });
    });
  });
});
