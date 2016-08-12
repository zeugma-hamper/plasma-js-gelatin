
// (c) oblong industries

#ifndef GELATIN_WRAPPERS_H
#define GELATIN_WRAPPERS_H

#include <assert.h>
#include <libLoam/c/ob-attrs.h>
#include <nan.h>
#include "handles.hh"

namespace gelatin {

class NodeSlaw : public Nan::ObjectWrap {
 public:
  static NAN_MODULE_INIT(Init);
  // NB: NilValue() is *not* multi-isolate safe
  static v8::Local<v8::Value> NilValue();

 private:
  explicit NodeSlaw(SlawHandle s) : slaw_(std::move(s)) {}
  ~NodeSlaw() {}

  static NAN_METHOD(New);
  static Nan::Persistent<v8::Function> &constructor() {
    static Nan::Persistent<v8::Function> my_ctor;
    return my_ctor;
  }
  static NAN_METHOD(ToString);
  static NAN_METHOD(ToValue);
  static NAN_GETTER(GetNil);
  SlawHandle slaw_;
};

class NodeProtein : public Nan::ObjectWrap {
 public:
  static NAN_MODULE_INIT(Init);
  static bool HasInstance(v8::Local<v8::Value>);
  static v8::Handle<v8::Object> FromSlawHandle(SlawHandle s);

  const SlawHandle &Protein() const { return slaw_; }

 private:
  explicit NodeProtein(SlawHandle s) : slaw_(std::move(s)) {
    assert(slaw_is_protein(slaw_.Borrow()));
  }
  ~NodeProtein() {}

  static NAN_METHOD(New);
  static Nan::Persistent<v8::Function> &constructor() {
    static Nan::Persistent<v8::Function> my_ctor;
    return my_ctor;
  }
  static Nan::Persistent<v8::FunctionTemplate> &constructor_template() {
    static Nan::Persistent<v8::FunctionTemplate> my_tpl;
    return my_tpl;
  }
  static NAN_GETTER(GetDescrips);
  static NAN_GETTER(GetIngests);
  static NAN_GETTER(GetLength);
  static NAN_METHOD(ToBuffer);

  static NAN_METHOD(FromBuffer);
  SlawHandle slaw_;
};
}

#endif
