
// (c) oblong industries

#include "byte_serial.hh"

#include <libLoam/c/ob-coretypes.h>
#include <libLoam/c/ob-log.h>
#include <libLoam/c/ob-retorts.h>
#include <libPlasma/c/protein.h>
#include <libPlasma/c/slaw.h>
#include <libPlasma/c/slaw-io.h>

#include "convert.hh"
#include "handles.hh"
#include "macros.hh"
#include "wrappers.hh"

namespace gelatin {

namespace {

using namespace gelatin;

NAN_METHOD(SlawLenFromHeader) {
  Nan::HandleScope scope;

  // Given a Buffer holding the first oct of a slaw, returns the number of
  // bytes total in the slaw.
  v8::Local<v8::Value> js_buf = info[0];
  if (!node::Buffer::HasInstance(js_buf)) {
    Nan::ThrowTypeError("first argument must be a Buffer");
    return;
  }
  const char *const buf = node::Buffer::Data(js_buf);
  const size_t buflen = node::Buffer::Length(js_buf);
  if (buflen != 8) {
    Nan::ThrowRangeError("argument Buffer must hold exactly 8 bytes.");
    return;
  }
  unt64 len = slaw_len((bslaw)buf);

  if (len > std::numeric_limits<int32_t>::max()) {
    OB_LOG_WARNING("Overly huge protein (%" OB_FMT_64
                   "u bytes) length in header oct.\n",
                   len);
    Nan::ThrowRangeError(
        "Sorry, 32-bits of protein size should be enough for anyone (so say "
        "Node and Javascript).");
    return;
  } else if (len <= 0) {
    unt64 oct;
    memcpy(&oct, buf, 8);
    OB_LOG_ERROR("Funky protein header oct: %016" OB_FMT_64 "x\n", oct);
    Nan::ThrowError("Incomprehensible protein header oct");
    return;
  }

  v8::Local<v8::Value> ret = Nan::New<v8::Number>(static_cast<double>(len));
  info.GetReturnValue().Set(ret);
}

}  // namespace

NAN_MODULE_INIT(ByteSerial::Init) {
  Nan::Export(target, "slawLenFromHeader", SlawLenFromHeader);
}

}  // namespace gelatin
