'use strict';

const Ribosome = require('../lib/Ribosome');
const fs = require('fs');
const tap = require('tap');

function loadFixture(filename) {
  const path = require('path');
  // The first 8 bytes are a header we'd like to skip.
  return fs.createReadStream(path.join(__dirname, '..', 'fixtures', filename),
                             {start: 8});
}

tap.test('hello world protein', (t) => {
  const fixture = loadFixture('hello-world.protein');
  const ribo = new Ribosome();
  let proteins = fixture.pipe(ribo);
  let count = 0;
  proteins.on('data', (protein) => {
    // bleh.
    t.equal(protein.length, 48);
    t.same(protein.descrips, ['hello', 'world']);
    t.same(protein.ingests, new Map());
    count++;
  });
  proteins.on('end', () => {
    t.equal(count, 1);
    t.end();
  });
});

tap.test('conversation protein', (t) => {
  const fixture = loadFixture('conversation.protein');
  const ribo = new Ribosome();
  let proteins = fixture.pipe(ribo);
  let count = 0;
  proteins.once('data', (protein) => {
    t.equal(protein.length, 48);
    t.same(protein.descrips, ['hello', 'world']);
    count++;
    proteins.once('data', (protein) => {
      t.equal(protein.length, 64);
      t.same(protein.descrips, ['goodbye', 'cruel', 'world']);
      t.same(protein.ingests, new Map());
      count++;
    });
  });
  proteins.on('end', () => {
    t.equal(count, 2);
    t.end();
  });
});

tap.test('huge protein', (t) => {
  const fixture = loadFixture('huge.protein');
  const ribo = new Ribosome();
  let proteins = fixture.pipe(ribo);
  let count = 0;
  proteins.on('data', (protein) => {
    t.equal(protein.length, 122168);
    t.equal(protein.descrips.length, 6001);
    t.same(protein.ingests, new Map());
    count++;
  });
  proteins.on('end', () => {
    t.equal(count, 1);
    t.end();
  });
});

tap.test('thumbnail nested protein with out of range ingest', (t) => {
  const fixture = loadFixture('thumbnail.protein');
  const ribo = new Ribosome();
  const proteins = fixture.pipe(ribo);
  let count = 0;
  proteins.on('data', (protein) => {
    count++;
    t.same(protein.descrips, ['thumbnail']);
    const buf = protein.ingests.get('buf');
    t.same(buf.descrips, ['%gst-buffer', 'discont', 'delta-unit']);
    // Issue 54 - out of range unt64/int64 crashes gelatin
    const bufIng = buf.ingests;
    t.equal(bufIng.get('dur'), undefined);
  });
  proteins.on('end', () => {
    t.equal(count, 1);
    t.end();
  });
});
