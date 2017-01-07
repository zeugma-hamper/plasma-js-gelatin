
// (c) oblong industries

'use strict';

const assert = require('assert');

const FEEDING = Symbol('FEEDING');
const EXPECTING = Symbol('EXPECTING');

// Feed a Muncher bytes.  Tell a Muncher that you'd like a certain number of
// bytes, and it will call you back when at least that many bytes are available
// in its internal buffer.

class Muncher {
  constructor() {
    this._chunks = [];
    this._state = FEEDING;
    this._bytesExpected = 0;
    this._expectCallback = null;
  }

  feed(buf) {
    this._chunks.push(buf);
    this._pump();
  }

  // Expect n bytes, call the callback when they're ready and write the bytes
  // to the provided buffer.  If no buffer is provided, one will be created and
  // passed to the callback.
  expect(n, buffer, callback) {
    if (typeof buffer === 'function') {
      callback = buffer;
      buffer = new Buffer(n);
    }
    assert.equal(this._state, FEEDING);
    assert.ok(n > 0, 'must expect at least one byte.');
    assert.ok(buffer.length >= n, 'buffer not big enough: ' + buffer.length +
              ' vs.' + n + ' bytes expected.');
    this._state = EXPECTING;
    this._bytesExpected = n;
    this._expectCallback = callback;
    this._outBuffer = buffer;
    this._pump();
  }

  _pump() {
    if (this._state != EXPECTING) {
      return;
    }
    const ready = this._chunks
          .map((xs) => xs.length)
          .reduce((x, y) => x + y, 0);
    if (ready < this._bytesExpected) {
      return;
    }

    let needed = this._bytesExpected;
    // "p" is like an output iterator pointing into this._outBuffer.  No
    // copying of the buffer's data will happen doing this.
    let p = this._outBuffer;
    while (needed > 0) {
      let chunk = this._chunks[0];
      assert.ok(chunk);
      if (chunk.length <= needed) {
        chunk.copy(p);
        needed -= chunk.length;
        this._chunks.shift();
      } else {
        // NB: this will keep the original allocation in this._chunks[0] alive
        // as long as the slice is alive.
        this._chunks[0] = chunk.slice(needed);
        chunk.copy(p);
        needed = 0;
      }
      p = p.slice(chunk.length);
    }

    this._bytesExpected = 0;
    let buf = this._outBuffer;
    this._outBuffer = null;

    this._state = FEEDING;
    this._expectCallback(buf);
  }
}

module.exports = Muncher;
