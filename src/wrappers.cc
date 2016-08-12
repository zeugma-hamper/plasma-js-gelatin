
// (c) oblong industries

#include "wrappers.hh"

#include <array>
#include <libLoam/c/ob-log.h>
#include <libPlasma/c/protein.h>
#include <libPlasma/c/slaw.h>
#include "convert.hh"

namespace gelatin {

NAN_MODULE_INIT(NodeSlaw::Init) {
  v8::Local<v8::FunctionTemplate> tpl = Nan::New<v8::FunctionTemplate>(New);
  tpl->SetClassName(Nan::New("Slaw").ToLocalChecked());
  tpl->InstanceTemplate()->SetInternalFieldCount(1);

  Nan::SetPrototypeMethod(tpl, "toString", NodeSlaw::ToString);
  Nan::SetPrototypeMethod(tpl, "toValue", NodeSlaw::ToValue);

  constructor().Reset(Nan::GetFunction(tpl).ToLocalChecked());
  Nan::SetAccessor(
      v8::Local<v8::Object>::Cast(Nan::GetFunction(tpl).ToLocalChecked()),
      Nan::New("nil").ToLocalChecked(), NodeSlaw::GetNil);

  // "target" is the "exports" object.
  Nan::Set(target, Nan::New("Slaw").ToLocalChecked(),
           Nan::GetFunction(tpl).ToLocalChecked());
}

NAN_METHOD(NodeSlaw::New) {
  if (info.IsConstructCall()) {
    SlawHandle sh;
    if (!v8_to_slaw_throwy(info[0], &sh)) {
      return;
    }
    auto ns = new NodeSlaw(std::move(sh));
    ns->Wrap(info.This());
    info.GetReturnValue().Set(info.This());
  } else {
    constexpr int argc = 1;
    auto argv = std::array<v8::Local<v8::Value>, argc>{{info[0]}};
    auto ctor = Nan::New<v8::Function>(constructor());
    info.GetReturnValue().Set(ctor->NewInstance(argc, argv.data()));
  }
}

v8::Local<v8::Value> NodeSlaw::NilValue() {
  // XXX: This could use v8::Symbol::For or Symbol::ForApi to use the isolate's
  // global symbol registry, which would be multi-isolate safe, but then we
  // could suffer from name collisions...
  static v8::Persistent<v8::Symbol> pnil;
  Nan::EscapableHandleScope scope;
  if (pnil.IsEmpty()) {
    auto ctxt = Nan::GetCurrentContext();
    pnil.Reset(ctxt->GetIsolate(),
               v8::Symbol::New(ctxt->GetIsolate(),
                               Nan::New("Slaw#nil").ToLocalChecked()));
  }
  v8::Local<v8::Value> nil = Nan::New(pnil);
  return scope.Escape(nil);
}

NAN_METHOD(NodeSlaw::ToString) {
  NodeSlaw *ns = ObjectWrap::Unwrap<NodeSlaw>(info.Holder());
  bslaw slaw = ns->slaw_.Borrow();
  SlawHandle spew(slaw_spew_overview_to_string(slaw));
  v8::Local<v8::String> js_spew =
      Nan::New(slaw_string_emit(spew.Borrow())).ToLocalChecked();
  info.GetReturnValue().Set(js_spew);
}

NAN_METHOD(NodeSlaw::ToValue) {
  NodeSlaw *ns = ObjectWrap::Unwrap<NodeSlaw>(info.Holder());
  bslaw slaw = ns->slaw_.Borrow();
  v8::Local<v8::Value> js_val = slaw_to_v8(slaw).ToLocalChecked();
  info.GetReturnValue().Set(js_val);
}

NAN_GETTER(NodeSlaw::GetNil) {
  v8::Local<v8::Value> nil = NodeSlaw::NilValue();
  info.GetReturnValue().Set(nil);
}

NAN_MODULE_INIT(NodeProtein::Init) {
  v8::Local<v8::FunctionTemplate> tpl = Nan::New<v8::FunctionTemplate>(New);
  tpl->SetClassName(Nan::New("Protein").ToLocalChecked());
  v8::Local<v8::ObjectTemplate> inst = tpl->InstanceTemplate();
  inst->SetInternalFieldCount(1);

  Nan::SetAccessor(inst, Nan::New("descrips").ToLocalChecked(),
                   NodeProtein::GetDescrips);
  Nan::SetAccessor(inst, Nan::New("ingests").ToLocalChecked(),
                   NodeProtein::GetIngests);
  Nan::SetAccessor(inst, Nan::New("length").ToLocalChecked(),
                   NodeProtein::GetLength);
  Nan::SetPrototypeMethod(tpl, "toBuffer", NodeProtein::ToBuffer);

  constructor_template().Reset(tpl);
  constructor().Reset(Nan::GetFunction(tpl).ToLocalChecked());
  Nan::SetMethod(Nan::New<v8::Function>(constructor()), "fromBuffer",
                 NodeProtein::FromBuffer);

  Nan::Set(target, Nan::New("Protein").ToLocalChecked(),
           Nan::GetFunction(tpl).ToLocalChecked());
}

NAN_METHOD(NodeProtein::New) {
  if (info.IsConstructCall()) {
    SlawHandle descrips, ingests;
    if (!v8_to_slaw_throwy(info[0], &descrips) ||
        !v8_to_slaw_throwy(info[1], &ingests)) {
      return;
    }
    SlawHandle prot(protein_from(descrips.Borrow(), ingests.Borrow()));
    auto ns = new NodeProtein(std::move(prot));
    ns->Wrap(info.This());
    info.GetReturnValue().Set(info.This());
  } else {
    constexpr int argc = 2;
    auto argv = std::array<v8::Local<v8::Value>, argc>{{info[0], info[1]}};
    auto ctor = Nan::New<v8::Function>(constructor());
    info.GetReturnValue().Set(ctor->NewInstance(argc, argv.data()));
  }
}

NAN_METHOD(NodeProtein::FromBuffer) {
  // Tedious argument checking:
  v8::Local<v8::Value> buffer = info[0];
  if (!node::Buffer::HasInstance(buffer)) {
    Nan::ThrowTypeError("Argument must be a Buffer.");
    return;
  }
  bslaw slawval = (bslaw)node::Buffer::Data(buffer);
  if (!slaw_is_protein(slawval)) {
    if (slaw_is_swapped_protein(slawval))
      OB_LOG_INFO("hey, we got a swapped protein ovah heah.");
    Nan::ThrowTypeError("Buffer doesn't contain a protein.");
    return;
  }
  size_t buflen = node::Buffer::Length(buffer);
  int64 slawlen = slaw_len(slawval);
  if (slawlen < 0 || buflen != (size_t)slawlen) {
    Nan::ThrowTypeError("Buffer length doesn't agree with slaw length.");
    return;
  }

  // TODO: There's really no reason that NodeProtein couldn't just manage a
  // v8::Persistent<v8::Value> Buffer instead of a SlawHandle.  This dup is
  // pointless.  Sad!  issue #14
  SlawHandle sh;
  slaw newslaw = slaw_dup(slawval);
  if (!newslaw) {
    OB_FATAL_ERROR("slaw_dup failed because out of memory!");
  }
  sh.Reset(newslaw);
  Nan::New<v8::Function>(constructor());
  info.GetReturnValue().Set(NodeProtein::FromSlawHandle(std::move(sh)));
}

NAN_GETTER(NodeProtein::GetDescrips) {
  NodeProtein *np = ObjectWrap::Unwrap<NodeProtein>(info.Holder());
  bprotein p = np->slaw_.Borrow();
  bslaw descrips = protein_descrips(p);

  v8::Local<v8::Value> js_val = slaw_to_v8(descrips).ToLocalChecked();
  info.GetReturnValue().Set(js_val);
}

NAN_GETTER(NodeProtein::GetIngests) {
  NodeProtein *np = ObjectWrap::Unwrap<NodeProtein>(info.Holder());
  bprotein p = np->slaw_.Borrow();
  bslaw ingests = protein_ingests(p);

  v8::Local<v8::Value> js_val = slaw_to_v8(ingests).ToLocalChecked();
  info.GetReturnValue().Set(js_val);
}

NAN_GETTER(NodeProtein::GetLength) {
  NodeProtein *np = ObjectWrap::Unwrap<NodeProtein>(info.Holder());
  bslaw s = np->slaw_.Borrow();
  int64 len = slaw_len(s);
  if (len < 1) {
    OB_FATAL_BUG("slaw_len() returned %" OB_FMT_64 "d", len);
  }
  v8::Local<v8::Value> js_val = Nan::New<v8::Number>(len);
  info.GetReturnValue().Set(js_val);
}

NAN_METHOD(NodeProtein::ToBuffer) {
  // XXX: this is one spot where issue #14 would be nice... (although some way
  // to make the buffer "read only" would be a requirement)

  NodeProtein *np = ObjectWrap::Unwrap<NodeProtein>(info.Holder());
  bslaw s = np->slaw_.Borrow();
  int64 len = slaw_len(s);
  if (len < 1) {
    OB_FATAL_BUG("slaw_len() returned %" OB_FMT_64 "d", len);
  }
  if (len > node::Buffer::kMaxLength) {
    OB_LOG_ERROR("protein is too large (%" OB_FMT_64
                 "d bytes) to fit in a Node buffer.",
                 len);
    Nan::ThrowError("Protein length is too large to fit in a buffer.");
    return;
  }
  v8::Local<v8::Value> buf =
      Nan::CopyBuffer((const char *)s, (uint32_t)len).ToLocalChecked();
  info.GetReturnValue().Set(buf);
}

v8::Handle<v8::Object> NodeProtein::FromSlawHandle(SlawHandle s) {
  Nan::EscapableHandleScope scope;

  OBSERT(slaw_is_protein(s.Borrow()));
  auto ns = new NodeProtein(std::move(s));
  auto ctor = Nan::New<v8::Function>(constructor());
  auto obj = ctor->NewInstance(Nan::GetCurrentContext()).ToLocalChecked();
  ns->Wrap(obj);
  return scope.Escape(obj);
}

bool NodeProtein::HasInstance(v8::Local<v8::Value> v8_val) {
  Nan::HandleScope scope;
  v8::Local<v8::FunctionTemplate> tpl = Nan::New(constructor_template());
  return tpl->HasInstance(v8_val);
}

}  // namespace gelatin
