
// (c) oblong industries

// A Transform stream that accepts bytes as input and produces a stream
// of Proteins as output.

'use strict';

const Muncher = require('./Muncher');
const Protein = require('./native').Protein;
const native = require('./native');
const stream = require('stream');

const PROTEIN_HEADER_SIZE = 8;

function debuglog(...argz) {
  if (false) { // eslint-disable-line no-constant-condition
    console.log(...argz);
  }
}

class Ribosome extends stream.Transform {
  constructor(options) {
    let opts = Object.assign({}, options, {
      decodeStrings: true,
      readableObjectMode: true,
    });
    super(opts);
    this._muncher = new Muncher();
    this._rawHeader = new Buffer(PROTEIN_HEADER_SIZE); // reusable
    this._rawProtein = null; // not reusable :(

    // Where the magic happens: two mutually recursive callbacks which are
    // called by the Muncher when bytes for the protein header and protein
    // body, respectively, are ready.  Bytes are fed to the muncher in the
    // _transform callback.
    let handleHeader = () => {
      let slawLen;
      try {
        slawLen = native.slawLenFromHeader(this._rawHeader);
      } catch (e) {
        this.emit('error', e);
      }
      this._rawProtein = new Buffer(slawLen);
      this._rawHeader.copy(this._rawProtein);
      this._muncher.expect(slawLen - PROTEIN_HEADER_SIZE,
                           this._rawProtein.slice(PROTEIN_HEADER_SIZE),
                           handleProtein);
    };

    let handleProtein = () => {
      try {
        debuglog('DEBUG: PROTEIN', this._rawProtein, 'with len',
                 this._rawProtein.length);
        let prot = Protein.fromBuffer(this._rawProtein);
        this.push(prot);
      } catch (e) {
        this.emit('error', e);
      }
      this._muncher.expect(PROTEIN_HEADER_SIZE, this._rawHeader,
                           handleHeader);
    };

    this._muncher.expect(PROTEIN_HEADER_SIZE, this._rawHeader,
                         handleHeader.bind(this));
  }

  _transform(chunk, encoding, done) {
    debuglog('transform called with', chunk.length, 'bytes');
    this._muncher.feed(chunk);
    done();
  }
}

module.exports = Ribosome;
