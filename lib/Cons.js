'use strict';

const ilkhanate = require('./native').ilkhanate;

class Cons {
  constructor(car, cdr) {
    this[ilkhanate.ILK] = ilkhanate.CONS;
    if (car === null || cdr === null)
      throw new TypeError('Slaw cons values may not be constructed from nulls');
    this._car = car;
    this._cdr = cdr;
  }
  get car() {
    return this._car;
  }
  get cdr() {
    return this._cdr;
  }
}

ilkhanate.registerIlkConstructor(ilkhanate.CONS, Cons);

module.exports = Cons;
