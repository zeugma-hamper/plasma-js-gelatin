// Rough compatibility layer with plasma-js-bridge.
//
// "The stuff that's too nasty even for gelatin"

/**
 * @module gelatin/compat
 */

'use strict';

const path = require('path');
const spawn = require('child_process').spawn;
const G_SPEAK_HOME = require('./native').G_SPEAK_HOME;
const peek = require('./peek');

function indexOrError(process, callback) {
  let out = '';
  let err = '';
  process.stdout.setEncoding('utf-8');
  process.stdout.on('data', (data) => {
    out += data;
  });
  process.stderr.on('data', (data) => {
    err += data;
  });
  // Fun stuff: this used to be process.on('exit', ...), but it turns out that
  // the 'exit' event sometimes fired before the first 'data' event from
  // stdout.  'close' is more reliable.
  process.on('close', (code, signal) => {
    if (code == 0) {
      let idx = parseInt(out);
      if (Number.isNaN(idx)) {
        console.error('could not parse output from compat process',
                      `${process.pid}:`);
        console.error(out);
        idx = null;
      }
      callback(idx);
    } else {
      console.error(`compat process ${process.pid} ` +
                    'exited ' + (code ? `with code ${code}`
                                 : `from signal ${signal}`));
      console.error('stderr was:', err);
      callback(null);
    }
  });
}

function readOnce(protStream, callback) {
  protStream.once('data', function(prot) {
    callback(prot);
  });
  protStream.once('error', function(err) {
    console.error('error reading protein stream: ', err);
    callback(null);
  });
}

/**
 * @callback indexCallback
 * @param {number} index pool index, or null in case of error.
 */

/**
 * oldestIndex finds the oldest index in the given pool and passes it to the
 * provided callback as a number.  Errors are logged, and signaled to the
 * callback by passing null as the argument.
 *
 * Due to limitations of Javascript, the result is undefined for pool indices
 * larger than 2**53 - 1.
 *
 * @param {string} pool name of pool
 * @param {indexCallback} callback
 * @return {ChildProcess}
 */
exports.oldestIndex = function oldestIndex(pool, callback) {
  let proc = spawn(path.join(G_SPEAK_HOME, 'bin', 'p-oldest-idx'), [pool]);
  indexOrError(proc, callback);
  return proc;
};

/**
 * newestIndex finds the newest index in the given pool and passes it to the
 * provided callback as a number.  Errors are logged, and signaled to the
 * callback by passing null as the argument.
 *
 * Due to limitations of Javascript, the result is undefined for pool indices
 * larger than 2**53 - 1.
 *
 * @param {string} pool name of pool
 * @param {indexCallback} callback
 * @return {ChildProcess}
 */
exports.newestIndex = function newestIndex(pool, callback) {
  let proc = spawn(path.join(G_SPEAK_HOME, 'bin', 'p-newest-idx'), [pool]);
  indexOrError(proc, callback);
  return proc;
};

/**
 * @callback ProteinCallback
 * @param {Protein} protein A Protein object, or null in case of error.
 */

/**
 * nth is currently unimplemented.
 * @param {string} pool name of pool
 * @param {ProteinCallback} callback
*/
exports.nth = function nth(pool, callback) {
  throw new Error('nth is unimplemented');
};

/**
 * oldest finds the oldest protein in the given pool and passes it to the
 * provided callback.  Errors are logged, and signaled to the callback by
 * passing null as the argument.
 *
 * @param {string} pool name of pool
 * @param {ProteinCallback} callback
 * @return {Ribosome}
 */
exports.oldest = function oldest(pool, callback) {
  let ribo = peek(pool, {_peekArgs: ['--rewind', '--limit', '1']});
  readOnce(ribo, callback);
  return ribo;
};

/**
 * newest finds the newest protein in the given pool and passes it to the
 * provided callback.  Errors are logged, and signaled to the callback by
 * passing null as the argument.
 *
 * @param {string} pool name of pool
 * @param {ProteinCallback} callback
 * @return {Ribosome}
 */
exports.newest = function newest(pool, callback) {
  let ribo = peek(pool, {_peekArgs: ['--backby', '1', '--limit', '1']});
  readOnce(ribo, callback);
  return ribo;
};
