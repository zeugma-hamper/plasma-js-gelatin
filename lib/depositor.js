
// (c) oblong industries

'use strict';

const G_SPEAK_HOME = process.env['GELATIN_G_SPEAK_HOME'] || require('./native').G_SPEAK_HOME;
const Proteasome = require('./Proteasome');
const path = require('path');
const spawn = require('child_process').spawn;

const assert = require('assert');
assert.ok(G_SPEAK_HOME);

const SLAW_FILE_MAGIC = new Buffer([0xff, 0xff, 0x0b, 0x10]);
const SLAW_FILE_VERSION = new Buffer([0x02, 0x01, 0x00, 0x00]);

function depositor(pool) {
  let proc = spawn(path.join(G_SPEAK_HOME, 'bin', 'poke'), ['-b', pool]);
  let coribo = new Proteasome();
  proc.stderr.on('data', (data) => {
    let str = data.toString();
    if (/^error:/.test(str)) {
      coribo.emit('error', new Error(data.toString()));
    } else {
      console.warn(str);
    }
  });
  proc.stdin.write(Buffer.concat([SLAW_FILE_MAGIC, SLAW_FILE_VERSION]));
  coribo.pipe(proc.stdin);

  return coribo;
}

module.exports = depositor;
