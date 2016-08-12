'use strict';

const Muncher = require('../lib/Muncher');
const tap = require('tap');

const DEAD = new Buffer([0xDE, 0xAD]);
const BEEF = new Buffer([0xBE, 0xEF]);
const DEADBEEF = Buffer.concat([DEAD, BEEF]);

tap.test('Muncher', (t) => {
  t.test('one feed, one total munch', (t) => {
    let m = new Muncher();
    m.expect(4, (data) => {
      t.same(data, DEADBEEF);
      t.end();
    });
    m.feed(DEADBEEF);
  });

  t.test('one feed, one total munch all after feeding', (t) => {
    let m = new Muncher();
    m.feed(DEADBEEF);
    m.expect(4, (data) => {
      t.same(data, DEADBEEF);
      t.end();
    });
  });

  t.test('one feed, repeated munching', (t) => {
    let m = new Muncher();
    m.expect(2, (data) => {
      t.same(data, DEAD);
      m.expect(2, (data) => {
        t.same(data, BEEF);
        t.end();
      });
    });
    m.feed(DEADBEEF);
  });

  t.test('two feed, one complete munch', (t) => {
    let m = new Muncher();
    m.feed(DEAD);
    m.expect(4, (data) => {
      t.same(data, DEADBEEF);
      t.end();
    });
    m.feed(BEEF);
  });

  t.test('two feeds, two munches across the split', (t) => {
    let m = new Muncher();
    m.expect(1, (data) => {
      t.same(data, DEADBEEF.slice(0, 1));
      m.expect(3, (data) => {
        t.same(data, DEADBEEF.slice(1));
        t.end();
      });
    });
    m.feed(DEAD);
    m.feed(BEEF);
  });

  t.test('two feed, one partial munch', (t) => {
    let m = new Muncher();
    m.expect(3, (data) => {
      t.same(data, DEADBEEF.slice(0, 3));
      t.end();
    });
    m.feed(DEAD);
    m.feed(BEEF);
  });
  t.end();
});
