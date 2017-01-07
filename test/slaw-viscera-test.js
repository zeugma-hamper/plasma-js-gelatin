'use strict';

let tap = require('tap');
let native = require('../lib/native');

tap.test('slaw length from buffer', (t) => {
  t.test('good buffer', (t) => {
    const oct = new Buffer([0x06, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x10]);
    const len = native.slawLenFromHeader(oct);
    t.equal(len, 48);
    t.end();
  });
  t.test('bad buffers', (t) => {
    const notOct = new Buffer([0x06, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]);
    t.throws(() => {
      native.slawLenFromHeader(notOct);
    });
    const hugeSlaw = new Buffer([0x06, 0xff, 0xff, 0xff, 0xff, 0xff, 0x1f]);
    t.throws(() => {
      native.slawLenFromHeader(hugeSlaw);
    });
    t.end();
  });
  t.end();
});
