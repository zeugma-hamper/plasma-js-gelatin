'use strict';

// The opposite of Ribosome.  An object Transform stream which accepts Proteins
// as input and produces bytes as output.

const Protein = require('./native').Protein;
const stream = require('stream');

class Proteasome extends stream.Transform {
  constructor(options) {
    let opts = Object.assign({}, options, {
      decodeStrings: true,
      writableObjectMode: true,
    });
    super(opts);
  }

  _transform(protein, encoding, done) {
    if (protein.constructor != Protein) {
      throw new TypeError('Proteasome can only consume Proteins.');
    }
    let bytes = protein.toBuffer();
    done(null, bytes);
  }
}

module.exports = Proteasome;
