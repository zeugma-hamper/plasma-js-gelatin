'use strict';

let native = require('./native');

module.exports = {
  depositor: require('./depositor'),
  Slaw: native.Slaw,
  Protein: native.Protein,
  Vect: require('./Vect'),
  peek: require('./peek'),
};

// these aren't exported... just to make jsdoc easier.
(justfordocs) => {
  /**
   * A wrapper around a slaw value.
   */
  class Slaw {
    /**
     * Construct a new Slaw from a Javascript value.
     * @param - value to convert
     * @throws {TypeError} if the provided value can't be converted to Slaw
     */
    constructor(val) {}

    /**
     * Convert the Slaw value to Javascript.
     * @throws {TypeError} if the Slaw value can't be converted to Javascript
     */
    toValue() {}
  }

  /**
   * Represents a Protein, a slaw-encoded message consisting of a list of
   * headers called the "descrips" and a map of data, called the "ingests".
   */
  class Protein {
    /**
     * Construct a new Protein from two Javascript values, the descrips and the
     * ingests.  The descrips and ingests will be converted to slaw values at
     * constructor time.
     * @param descrips value to use as descrips
     * @param ingests value to use as ingests
     * @throws {TypeError} if the descrips or ingests can't be converted to slaw
     */
    constructor(descrips, ingests) {}

    /**
     * The protein's descrips.
     */
    get descrips() {}
    /**
     * The protein's ingests.
     */
    get ingests() {}
  }
};
