
// (c) oblong industries

#include "gspeak_version.hh"

#include <string>
#include <libLoam/c/ob-dirs.h>

namespace gelatin {
namespace GspeakVersion {
NAN_MODULE_INIT(Init) {
  const char *g_speak_home = ob_get_standard_path(ob_prefix_dir);
  auto str = Nan::New(g_speak_home).ToLocalChecked();
  Nan::Set(target, Nan::New("G_SPEAK_HOME").ToLocalChecked(), str);
}
}
}
