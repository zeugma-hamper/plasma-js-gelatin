
// (c) oblong industries

#ifndef GELATIN_ILKHANATE_H
#define GELATIN_ILKHANATE_H

#include <nan.h>

// Ilkhanate is a "type tagging" system for JS values, used to select behavior
// for marshalling and unmarshalling JS values to/from slawx where there may
// otherwise be ambiguity.  The name comes from the libPlasma internal jargon
// "ilk", which means the "type" that a slaw has (unt32, list, etc.).
//
// For example, the Javascript-side `Vect` class installs the V3Float64 ilk on
// all objects produced by its constructor function.  When serialized to a
// slaw, the Vect instance's data is converted to a v3float64.  Without type
// tagging, a `Float64Array` instance of length 3 might be considered as either
// a v3float64 or a slaw numeric float64 array with 3 elements during
// conversion to slaw.
//
// By the same token, the part of gelatin that converts slawx into JS is able to
// produce Vect instances from v3float64 slawx by looking up the constructor
// function registered for the V3Float64 Ilk.  The Vect class (JS-side) is
// responsible for registering itself as the designated constructor function
// for v3float64 slawx.
//
// None of this machinery should leak to users of gelatin; it should be
// considered an implementation detail.

namespace gelatin {
namespace Ilkhanate {
NAN_MODULE_INIT(Init);

enum class Ilk {
  Null,  // Represents "lack of Ilk".

  Cons,  // constructor(car,cdr)
  V2Float64,
  V2Int32,
  V3Float64,
  V4Float64,
};

Ilk GetIlk(v8::Local<v8::Object>);
bool HasIlk(v8::Local<v8::Object>, Ilk);
v8::Local<v8::Function> GetIlkConstructor(Ilk);
}
}

#endif
