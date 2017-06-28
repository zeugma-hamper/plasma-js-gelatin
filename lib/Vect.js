
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
   * @param {Array} f64arr - the coordinates of the `Vect`.  Can be a
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
  get x() {
    return this._arr[0];
  }
  set x(a) {
    this._arr[0] = a;
  }
  get 0() {
    return this._arr[0];
  }
  set 0(a) {
    this._arr[0] = a;
  }

  /**
   * @type {number}
   */
  get y() {
    return this._arr[1];
  }
  set y(a) {
    this._arr[1] = a;
  }
  get 1() {
    return this._arr[1];
  }
  set 1(a) {
    this._arr[1] = a;
  }

  /**
   * @type {number}
   */
  get z() {
    return this._arr[2];
  }
  set z(a) {
    this._arr[2] = a;
  }
  get 2() {
    return this._arr[2];
  }
  set 2(a) {
    this._arr[2] = a;
  }

  get array() {
    return this._arr;
  }
}

/**
 * Represents a 2-vector; slawx of the `v2float64` type are converted to
 * instances of this class, and vice versa.
 *
 * @example
 * let pos = new Vect2([0.0, 1.0]);
 * // Construct a protein with an ingest "pos" being the v2float64
 * // ("Vect2") above.
 * let prot = new Protein(["foo", "bar"], { screenCoord: pos });
 */
class Vect2 {
  /**
   * Create a `Vect2` from an array of numbers.
   * @param {Array} f64arr - the coordinates of the `Vect2`.  Can be a
   * `Float64Array` or plain `Array`.
   * @throws - Raises an error if the parameter's length is not 2.
   */
  constructor(f64arr) {
    assert.equal(f64arr.length, 2);
    this[ilkhanate.ILK] = ilkhanate.V2FLOAT64;
    this._arr = f64arr;
  }

  /**
   * @type {number}
   */
  get x() {
    return this._arr[0];
  }
  set x(a) {
    this._arr[0] = a;
  }
  get 0() {
    return this._arr[0];
  }
  set 0(a) {
    this._arr[0] = a;
  }

  /**
   * @type {number}
   */
  get y() {
    return this._arr[1];
  }
  set y(a) {
    this._arr[1] = a;
  }
  get 1() {
    return this._arr[1];
  }
  set 1(a) {
    this._arr[1] = a;
  }

  get array() {
    return this._arr;
  }
}

/**
 * Represents a 2-vector of integers; slawx of the `v2int32` type are converted
 * to instances of this class, and vice versa.
 *
 * @example
 * let pos = new Vect2([1980, 420]);
 * // Construct a protein with an ingest "pos" being the v2float64
 * // ("Vect2") above.
 * let prot = new Protein(["foo", "bar"], { screenSize: pos });
 */
class Vect2i {
  /**
   * Create a `Vect2i` from an array of numbers.
   * @param {Array} i32arr - the coordinates of the `Vect2`.  Can be an
   * `Int32Array` or plain `Array`.
   * @throws - Raises an error if the parameter's length is not 2.
   */
  constructor(i32arr) {
    assert.equal(i32arr.length, 2);
    this[ilkhanate.ILK] = ilkhanate.V2INT32;
    this._arr = i32arr;
  }

  /**
   * @type {number}
   */
  get x() {
    return this._arr[0];
  }
  set x(a) {
    this._arr[0] = a;
  }
  get 0() {
    return this._arr[0];
  }
  set 0(a) {
    this._arr[0] = a;
  }

  /**
   * @type {number}
   */
  get y() {
    return this._arr[1];
  }
  set y(a) {
    this._arr[1] = a;
  }
  get 1() {
    return this._arr[1];
  }
  set 1(a) {
    this._arr[1] = a;
  }

  get array() {
    return this._arr;
  }
}

/**
 * Represents a 4-vector; slawx of the `v4float64` type are converted to
 * instances of this class, and vice versa.
 *
 * @example
 * let orange = new Vect4([1.0, 0.647, 0.0, 1.0]);
 * // Construct a protein with an ingest "pos" being the v2float64
 * // ("Vect4") above.
 * let prot = new Protein(["foo", "bar"], { color: orange });
 */
class Vect4 {
  /**
   * Create a `Vect4` from an array of numbers.
   * @param {Array} f64arr - the coordinates of the `Vect4`.  Can be a
   * `Float64Array` or plain `Array`.
   * @throws - Raises an error if the parameter's length is not 4.
   */
  constructor(f64arr) {
    assert.equal(f64arr.length, 4);
    this[ilkhanate.ILK] = ilkhanate.V4FLOAT64;
    this._arr = f64arr;
  }

  /**
   * @type {number}
   */
  get x() {
    return this._arr[0];
  }
  set x(a) {
    this._arr[0] = a;
  }
  get 0() {
    return this._arr[0];
  }
  set 0(a) {
    this._arr[0] = a;
  }

  /**
   * @type {number}
   */
  get y() {
    return this._arr[1];
  }
  set y(a) {
    this._arr[1] = a;
  }
  get 1() {
    return this._arr[1];
  }
  set 1(a) {
    this._arr[1] = a;
  }

  /**
   * @type {number}
   */
  get z() {
    return this._arr[2];
  }
  set z(a) {
    this._arr[2] = a;
  }
  get 2() {
    return this._arr[2];
  }
  set 2(a) {
    this._arr[2] = a;
  }

  /**
   * @type {number}
   */
  get w() {
    return this._arr[3];
  }
  set w(a) {
    this._arr[3] = a;
  }
  get 3() {
    return this._arr[3];
  }
  set 3(a) {
    this._arr[3] = a;
  }

  get array() {
    return this._arr;
  }
}

ilkhanate.registerIlkConstructor(ilkhanate.V2FLOAT64, Vect2);
ilkhanate.registerIlkConstructor(ilkhanate.V2INT32, Vect2i);
ilkhanate.registerIlkConstructor(ilkhanate.V3FLOAT64, Vect);
ilkhanate.registerIlkConstructor(ilkhanate.V4FLOAT64, Vect4);

module.exports = {
  Vect: Vect,
  Vect2: Vect2,
  Vect2i: Vect2i,
  Vect4: Vect4,
};
