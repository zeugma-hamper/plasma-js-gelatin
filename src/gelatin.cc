
/* (c) oblong industries */

#include <array>
#include <memory>
#include <utility>
#include <vector>
#include <assert.h>

#include <nan.h>

#include "byte_serial.hh"
#include "convert.hh"
#include "gspeak_version.hh"
#include "ilkhanate.hh"
#include "handles.hh"
#include "macros.hh"
#include "wrappers.hh"

namespace {

NAN_MODULE_INIT(Init) {
  using namespace gelatin;
  ByteSerial::Init(target);
  Ilkhanate::Init(target);
  NodeSlaw::Init(target);
  NodeProtein::Init(target);
  GspeakVersion::Init(target);
}

NODE_MODULE(gelatin, Init)

}  // anonymous namespace
