
// (c) oblong industries

'use strict';

const assert = require('assert');
const ilkhanate = require('./native').ilkhanate;

/**
 * Represents a 3-vector; slawx of the `v3float64` type are converted to
 * instances of this class, and vice versa.
 *
 * @example
 * let pos = new Vect([0.0, 150.0, -300.0]);
 * // Construct a protein with an ingest "pos" being the v3float64
 * // ("Vect") above.
 * let prot = new Protein(["foo", "bar"], { pos: pos });
 */
class Vect {
  /**
   * Create a `Vect` from an array of numbers.
   * @param {Array} xs - the coordinates of the `Vect`.  Can be a
   * `Float64Array` or plain `Array`.
   * @throws - Raises an error if the parameter's length is not 3.
   */
  constructor(f64arr) {
    assert.equal(f64arr.length, 3);
    this[ilkhanate.ILK] = ilkhanate.V3FLOAT64;
    this._arr = f64arr;
  }

  /**
   * @type {number}
   */
  get x() { return this._arr[0]; }
  set x(a) { this._arr[0] = a; }
  get 0() { return this._arr[0]; }
  set 0(a) { this._arr[0] = a; }

  /**
   * @type {number}
   */
  get y() { return this._arr[1]; }
  set y(a) { this._arr[1] = a; }
  get 1() { return this._arr[1]; }
  set 1(a) { this._arr[1] = a; }

  /**
   * @type {number}
   */
  get z() { return this._arr[2]; }
  set z(a) { this._arr[2] = a; }
  get 2() { return this._arr[2]; }
  set 2(a) { this._arr[2] = a; }

  get array() { return this._arr; }
}

ilkhanate.registerIlkConstructor(ilkhanate.V3FLOAT64, Vect);

module.exports = Vect;
