'use strict';

// A simple "hose" that uses a peek process with Ribosome.

const G_SPEAK_HOME = require('./native').G_SPEAK_HOME;
const Ribosome = require('./Ribosome');
const path = require('path');
const spawn = require('child_process').spawn;
const stream = require('stream');

const assert = require('assert');
assert.ok(G_SPEAK_HOME);

const SLAW_FILE_MAGIC = new Buffer([0xff, 0xff, 0x0b, 0x10]);
class SlawFileHeaderSkipper extends stream.Transform {
  constructor() {
    super();
    this._pastHeader = false;
  }

  _transform(chunk, encoding, done) {
    if (!this._pastHeader && chunk.slice(0, 4).equals(SLAW_FILE_MAGIC)) {
      chunk = chunk.slice(8);
    }
    this._pastHeader = true;
    this.push(chunk);
    done();
  }
}

function peek(pool, callback) {
  let proc = spawn(path.join(G_SPEAK_HOME, 'bin', 'peek'), ['-b', pool]);
  let ribo = new Ribosome();

  proc.stderr.on('data', (data) => {
    let str = data.toString();
    if (/^error:/.test(str)) {
      ribo.emit('error', new Error(data.toString()));
    } else {
      console.warn(str);
    }
  });
  proc.stdout.pipe(new SlawFileHeaderSkipper()).pipe(ribo);

  ribo.end = function() {
    // Kill the "writable" end of the pipe.
    proc.kill();
  };

  // plasma-js-bridge compat.
  if (callback) {
    // Freaky reverse callbacks.  See https://github.com/Oblong/plasma-js-bridge/issues/10
    ribo.on('error', () => callback(null));
    ribo.on('data', callback);
  }
  ribo.kill = function() {
    ribo.end();
  };

  return ribo;
}

module.exports = peek;
