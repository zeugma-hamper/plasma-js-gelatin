'use strict';

const tap = require('tap');
const Slaw = require('../').Slaw;

function roundTrip(t, val) {
  let found = new Slaw(val).toValue();
  t.strictSame(found, val);
}

tap.test('Slaw null roundtrip (plus undefined)', function(t) {
  roundTrip(t, null);
  t.strictSame(new Slaw(undefined).toValue(), null);
  t.end();
});

tap.test('Slaw nil roundtrip', function(t) {
  roundTrip(t, Slaw.nil);
  t.end();
});

tap.test('Slaw string roundtrip', function(t) {
  roundTrip(t, 'Österreich');
  t.end();
});

tap.test('Slaw boolean roundtrip', function(t) {
  roundTrip(t, true);
  roundTrip(t, false);
  t.end();
});

tap.test('Slaw numeric roundtrip', function(t) {
  for (let n of [0, 1234, 0x7fffffff, -0x80000000, 0.12345]) {
    let found = new Slaw(n).toValue();
    t.equal(found, n);
  }

  let nan = new Slaw(Number.NaN).toValue();
  t.ok(Number.isNaN(nan));
  t.end();
});

tap.test('Slaw map roundtrip', function(t) {
  roundTrip(t, new Map());
  roundTrip(t, new Map([['foo', true], ['bar', 'baz']]));
  roundTrip(t, new Map([['such', new Map([['nested',
                                           new Map([['wow', true]])]])]]));
  t.end();
});

tap.test('Slaw list roundtrip', function(t) {
  roundTrip(t, []);
  roundTrip(t, ['foo']);
  roundTrip(t, ['foo', 'bar', 'baz']);
  roundTrip(t, [new Map([['foo', true],
                         ['bar', false],
                         ['baz', [true, false, true]]])]);
  t.end();
});

tap.test('Slaw Vect roundtrip', function(t) {
  const Vect = require('../').Vect;
  roundTrip(t, new Vect(new Float64Array([0, 1, 2])));
  roundTrip(t, new Vect(new Float64Array([0, 15, 27])));
  t.end();
});

tap.test('Slaw Protein roundtrip', function(t) {
  const Protein = require('../').Protein;
  roundTrip(t, new Protein([], {foo: 123}));
  roundTrip(t, [new Protein([], {foo: 123}), new Protein([], {bar: 456})]);
  t.end();
});
