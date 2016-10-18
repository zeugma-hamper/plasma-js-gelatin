
// (c) oblong industries

#include "convert.hh"

#include <assert.h>
#include <memory>
#include <libLoam/c/ob-log.h>
#include <libPlasma/c/slaw.h>
#include <libPlasma/c/slaw-coerce.h>

#include "handles.hh"
#include "ilkhanate.hh"
#include "macros.hh"
#include "wrappers.hh"

#define OB_IN_TOO_DEEP -(OB_RETORTS_APP_FIRST + 0)

namespace gelatin {

namespace {

struct slabu_deleter {
  void operator()(slabu *s) { slabu_free(s); }
};

using unique_slabu = std::unique_ptr<slabu, slabu_deleter>;

unique_slabu make_unique_slabu() {
  auto sb = slabu_new();
  assert(sb);
  return unique_slabu(sb, slabu_deleter());
};

// Helper for indexed access into arrays of numbers.
inline float64 GetFloat64(v8::Local<v8::Object> ob, unt32 idx) {
  v8::Local<v8::Value> val = Nan::Get(ob, idx).ToLocalChecked();
  return val->ToNumber(Nan::GetCurrentContext()).ToLocalChecked()->Value();
}

}  // anonymous namespace

ob_retort v8_to_slaw(v8::Local<v8::Value> js_val, SlawHandle *s, size_t depth) {
  Nan::HandleScope scope;

  depth++;
  constexpr size_t maxdepth = 512;
  if (depth > maxdepth) {
    OB_LOG_WARNING("v8_to_slaw hit the recursion limit (%zu)", maxdepth);
    return OB_IN_TOO_DEEP;
  }

  if (js_val->IsNull() || js_val->IsUndefined()) {
    s->Reset(nullptr);
  } else if (js_val->IsBoolean()) {
    bool val = js_val->BooleanValue();
    s->Reset(slaw_boolean(val));
  } else if (js_val->IsInt32()) {
    int32 n = js_val->Int32Value();
    s->Reset(slaw_int32(n));
  } else if (js_val->IsUint32()) {
    unt32 n = js_val->Uint32Value();
    s->Reset(slaw_unt32(n));
  } else if (js_val->IsNumber()) {
    float64 n = js_val->NumberValue(Nan::GetCurrentContext()).FromJust();
    s->Reset(slaw_float64(n));
  } else if (js_val->IsString() || js_val->IsStringObject()) {
    Nan::Utf8String str(js_val->ToString());
    s->Reset(slaw_string_from_substring(*str, str.length()));
  } else if (js_val->IsArray()) {
    Nan::HandleScope scope;
    v8::Local<v8::Object> ob = js_val->ToObject();
    v8::Local<v8::Array> arr = v8::Local<v8::Array>::Cast(ob);

    auto sb = make_unique_slabu();
    const uint32_t len = arr->Length();
    for (uint32_t i = 0; i < len; i++) {
      SlawHandle sh;
      v8::Local<v8::Value> val = arr->Get(i);
      TRY_(v8_to_slaw(val, &sh, depth));
      slabu_list_add(sb.get(), sh.Borrow());
    }
    s->Reset(slaw_list(sb.get()));
  } else if (js_val->IsMap()) {
    Nan::HandleScope scope;
    v8::Local<v8::Context> ctxt = Nan::GetCurrentContext();
    v8::Local<v8::Map> js_map = v8::Handle<v8::Map>::Cast(js_val);
    auto sb = make_unique_slabu();
    v8::Local<v8::Array> map_arr = js_map->AsArray();
    const uint32_t len = map_arr->Length();
    assert(len % 2 == 0);
    for (uint32_t i = 0; i < len; i += 2) {
      SlawHandle sh_key, sh_val;
      v8::Local<v8::Value> key = map_arr->Get(ctxt, i).ToLocalChecked();
      v8::Local<v8::Value> val = map_arr->Get(ctxt, i + 1).ToLocalChecked();
      TRY_(v8_to_slaw(key, &sh_key, depth));
      TRY_(v8_to_slaw(val, &sh_val, depth));
      slabu_map_put(sb.get(), sh_key.Borrow(), sh_val.Borrow());
    }
    s->Reset(slaw_map(sb.get()));
  } else if (js_val->IsObject()) {
    Nan::HandleScope scope;
    v8::Local<v8::Context> ctxt = Nan::GetCurrentContext();
    v8::Local<v8::Object> ob = js_val->ToObject(ctxt).ToLocalChecked();

    // Proteins are special and don't have an ilk (see issue #27)
    if (NodeProtein::HasInstance(ob)) {
      NodeProtein *np = NodeProtein::Unwrap<NodeProtein>(ob);
      bslaw prot = np->Protein().Borrow();
      s->Reset(slaw_dup(prot));
      return OB_OK;
    }

    // Objects may be "tagged" with an "ilk" for special conversions.  For
    // example, objects constructed by Vect (see lib/Vect.js) have the
    // "V3Float64" ilk, so they're converted to a slaw v3float64.
    auto ilk = Ilkhanate::GetIlk(ob);
    if (ilk == Ilkhanate::Ilk::Null) {
      auto sb = make_unique_slabu();
      v8::Local<v8::Array> keys = ob->GetPropertyNames(ctxt).ToLocalChecked();
      const uint32_t len = keys->Length();
      for (uint32_t i = 0; i < len; i++) {
        SlawHandle skey, sval;
        v8::Local<v8::Value> key = keys->Get(ctxt, i).ToLocalChecked();
        v8::Local<v8::Value> val = ob->Get(ctxt, key).ToLocalChecked();
        TRY_(v8_to_slaw(key, &skey, depth));
        TRY_(v8_to_slaw(val, &sval, depth));
        slabu_map_put(sb.get(), skey.Borrow(), sval.Borrow());
      }
      s->Reset(slaw_map(sb.get()));
    } else if (ilk == Ilkhanate::Ilk::V3Float64) {
      v3float64 v;
      v.x = GetFloat64(ob, 0);
      v.y = GetFloat64(ob, 1);
      v.z = GetFloat64(ob, 2);
      s->Reset(slaw_v3float64(v));
    } else if (ilk == Ilkhanate::Ilk::V2Float64) {
      v2float64 v;
      v.x = GetFloat64(ob, 0);
      v.y = GetFloat64(ob, 1);
      s->Reset(slaw_v2float64(v));
    } else if (ilk == Ilkhanate::Ilk::V4Float64) {
      v4float64 v;
      v.x = GetFloat64(ob, 0);
      v.y = GetFloat64(ob, 1);
      v.z = GetFloat64(ob, 2);
      v.w = GetFloat64(ob, 3);
      s->Reset(slaw_v4float64(v));
    }
  } else if (js_val->Equals(NodeSlaw::NilValue())) {
    s->Reset(slaw_nil());
  } else {
    // TODO: numeric arrays (issue #2)
    // TODO: cons (issue #1)
    return OB_INVALID_ARGUMENT;
  }

  return OB_OK;
}

bool v8_to_slaw_throwy(v8::Local<v8::Value> js_val, SlawHandle *s) {
  Nan::HandleScope scope;

  ob_retort tort = v8_to_slaw(js_val, s, 0);
  if (tort == OB_IN_TOO_DEEP) {
    Nan::ThrowTypeError(
        "Converting circular (or deeply nested) structure to slaw.");
    return false;
  } else if (tort == OB_INVALID_ARGUMENT) {
    Nan::ThrowTypeError("Type is not convertible to slaw.");
    return false;
  } else if (tort < OB_OK) {
    std::string err = "Error converting to slaw: ";
    err += ob_error_string(tort);
    Nan::ThrowError(err.c_str());
    return false;
  }
  return true;
}

// Nice thing: we know slawx can't have cycles.  OTOH, a deeply nested slaw
// could still blow the stack...
Nan::MaybeLocal<v8::Value> slaw_to_v8(bslaw s) {
  Nan::EscapableHandleScope scope;
#define RETURN(x) return scope.Escape(x)
  if (!s) RETURN(Nan::Null());

  if (slaw_is_nil(s)) {
    RETURN(NodeSlaw::NilValue());
  } else if (slaw_is_boolean(s)) {
    RETURN(Nan::New(*slaw_boolean_emit(s)));
  } else if (slaw_is_numeric(s)) {
    const bool scalar =
        !slaw_is_numeric_complex(s) && !slaw_is_numeric_vector(s) &&
        !slaw_is_numeric_multivector(s) && !slaw_is_numeric_array(s);
    if (scalar) {
      // just make every scalar number a float64.  it's what crockford would
      // want.
      float64 out;
      if (slaw_to_float64(s, &out) < OB_OK) {
        Nan::ThrowError(
            "slaw scalar number to float64 conversion failed mysteriously "
            "(probably a bug in gelatin)");
        return {};
      }
      v8::Local<v8::Number> js_num = Nan::New<v8::Number>(out);
      RETURN(js_num);
    } else {
      if (slaw_is_numeric_vector(s)) {
        v8::Local<v8::Context> ctxt = Nan::GetCurrentContext();
        v8::Local<v8::Function> ilkctor;
        v8::Local<v8::Value> f64arr;

        // Urge to template rising...
        if (slaw_is_v3float64(s)) {
          auto buf =
              v8::ArrayBuffer::New(ctxt->GetIsolate(), sizeof(v3float64));
          const v3float64 *src = slaw_v3float64_emit(s);
          v3float64 *dst = (v3float64 *)buf->GetContents().Data();
          *dst = *src;

          constexpr size_t BYTELEN = 3;
          f64arr = v8::Float64Array::New(buf, 0, BYTELEN);
          ilkctor = Ilkhanate::GetIlkConstructor(Ilkhanate::Ilk::V3Float64);
        } else if (slaw_is_v2float64(s)) {
          auto buf =
              v8::ArrayBuffer::New(ctxt->GetIsolate(), sizeof(v2float64));
          const v2float64 *src = slaw_v2float64_emit(s);
          v2float64 *dst = (v2float64 *)buf->GetContents().Data();
          *dst = *src;

          constexpr size_t BYTELEN = 2;
          f64arr = v8::Float64Array::New(buf, 0, BYTELEN);
          ilkctor = Ilkhanate::GetIlkConstructor(Ilkhanate::Ilk::V2Float64);
        } else if (slaw_is_v4float64(s)) {
          auto buf =
              v8::ArrayBuffer::New(ctxt->GetIsolate(), sizeof(v4float64));
          const v4float64 *src = slaw_v4float64_emit(s);
          v4float64 *dst = (v4float64 *)buf->GetContents().Data();
          *dst = *src;

          constexpr size_t BYTELEN = 4;
          f64arr = v8::Float64Array::New(buf, 0, BYTELEN);
          ilkctor = Ilkhanate::GetIlkConstructor(Ilkhanate::Ilk::V4Float64);
        } else {
          SlawHandle str(slaw_spew_overview_to_string(s));
          OB_LOG_BUG(
              "Missing non-scalar numeric conversion.  Please file a bug with "
              "Oblong.  Include the following string describing the slaw:\n%s",
              slaw_string_emit(str.Borrow()));
          RETURN(Nan::Undefined());
        }
        v8::Local<v8::Value> vect =
            ilkctor->NewInstance(ctxt, 1, &f64arr).ToLocalChecked();
        RETURN(vect);
      }

      SlawHandle str(slaw_spew_overview_to_string(s));
      OB_LOG_BUG(
          "Missing non-scalar numeric conversion.  Please file a bug with "
          "Oblong.  Include the following string describing the slaw:\n%s",
          slaw_string_emit(str.Borrow()));
    }
  } else if (slaw_is_string(s)) {
    RETURN(Nan::New(slaw_string_emit(s)).ToLocalChecked());
  } else if (slaw_is_map(s)) {
    v8::Local<v8::Map> js_map =
        v8::Map::New(Nan::GetCurrentContext()->GetIsolate());
    bslaw cons = slaw_list_emit_first(s);
    while (cons != nullptr) {
      bslaw key = slaw_cons_emit_car(cons);
      bslaw val = slaw_cons_emit_cdr(cons);
      if (key == nullptr || val == nullptr) {
        Nan::ThrowError(
            "weird slaw map has something other than a cons "
            "(probably a bug in gelatin)");
        return {};
      }
      Nan::MaybeLocal<v8::Value> js_key = slaw_to_v8(key);
      // If slaw_to_v8() returned an empty MaybeLocal, then it should have
      // thrown an exception too.
      if (js_key.IsEmpty()) return {};
      Nan::MaybeLocal<v8::Value> js_val = slaw_to_v8(val);
      if (js_val.IsEmpty()) return {};
      js_map = js_map->Set(Nan::GetCurrentContext(), js_key.ToLocalChecked(),
                           js_val.ToLocalChecked())
                   .ToLocalChecked();
      cons = slaw_list_emit_next(s, cons);
    }
    RETURN(js_map);
  } else if (slaw_is_list(s)) {
    v8::Local<v8::Array> arr = Nan::New<v8::Array>();
    bslaw el = slaw_list_emit_first(s);
    int32_t i = 0;
    while (el != nullptr) {
      Nan::MaybeLocal<v8::Value> js_val = slaw_to_v8(el);
      // If slaw_to_v8() returned an empty MaybeLocal, then it should have
      // thrown an exception too.
      if (js_val.IsEmpty()) return {};
      Nan::Set(arr, i, js_val.ToLocalChecked());
      el = slaw_list_emit_next(s, el);
      ++i;
    }
    RETURN(arr);
  } else if (slaw_is_protein(s)) {
    // dup dup badup
    v8::Local<v8::Object> prot =
        NodeProtein::FromSlawHandle(SlawHandle(slaw_dup(s)));
    RETURN(prot);
  }
  SlawHandle serr(slaw_spew_overview_to_string(s));

  OB_LOG_BUG("MISSING SLAW CONVERSION, RETURNING UNDEFINED %s",
             slaw_string_emit(serr.Borrow()));
  RETURN(Nan::Undefined());
#undef RETURN
}

}  // namespace gelatin
