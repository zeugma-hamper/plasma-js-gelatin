
// (c) oblong industries

#ifndef GELATIN_CONVERT_H
#define GELATIN_CONVERT_H

#include <libLoam/c/ob-retorts.h>
#include <libPlasma/c/plasma-types.h>
#include <nan.h>

namespace gelatin {

class SlawHandle;

// Converts a v8 value to a slaw.  If successful, returns OB_OK.  Otherwise,
// returns an error retort.
ob_retort v8_to_slaw(v8::Local<v8::Value> js_val, SlawHandle *s, size_t depth);

// Converts a v8 value to a slaw.  If successful, returns true.  If not, throws
// an exception in JS-land and returns false.
bool v8_to_slaw_throwy(v8::Local<v8::Value> js_val, SlawHandle *s);

// Converts a slaw to a v8 value.  Returns a Nan::Undefined value or throws a
// JS-land eexception (and returns an empty MaybeLocal) when the conversion
// fails.  The dividing line between these failure modes is currently
// arbitrary, sorry.
Nan::MaybeLocal<v8::Value> slaw_to_v8(bslaw s);

}  // namespace gelatin

#endif
