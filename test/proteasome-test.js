'use strict';

const Proteasome = require('../lib/Proteasome');
const Protein = require('../lib/native').Protein;
const Ribosome = require('../lib/Ribosome');
const tap = require('tap');
const stream = require('stream');

tap.test('Proteasome sanity', (t) => {
  let hello = new Proteasome();
  let out = new Ribosome();
  hello.pipe(out);
  out.once('data', (protein) => {
    t.same(protein.descrips, ['hello', 'world']);
    t.end();
    hello.end();
  });
  hello.write(new Protein(['hello', 'world'], new Map()));
});
