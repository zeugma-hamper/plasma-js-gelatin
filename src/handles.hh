
// (c) oblong industries

#ifndef GELATIN_HANDLES_H
#define GELATIN_HANDLES_H

#include <libPlasma/c/slaw.h>

#include "macros.hh"

namespace gelatin {

// Basic RAII class for c-slaw that prevents copying and frees its slaw when
// destroyed.  Only offers const access to its underlying buffer to outsiders.
class SlawHandle {
 public:
  SlawHandle() : slaw_(nullptr) {}
  explicit SlawHandle(slaw s) : slaw_(s) {}
  SlawHandle(SlawHandle &&otra) noexcept : slaw_(otra.slaw_) {
    otra.slaw_ = nullptr;
  }
  SlawHandle &operator=(SlawHandle &&otra) noexcept {
    Swap(otra);
    return *this;
  }

  // Not strictly necessary, because a user-declared move ctor deletes these
  // implicitly.
  DISALLOW_COPY_AND_ASSIGN(SlawHandle);

  ~SlawHandle() { slaw_free(slaw_); }

  bslaw Borrow() const { return slaw_; }

  void Swap(SlawHandle &otra) noexcept {
    slaw tmp = slaw_;
    slaw_ = otra.slaw_;
    otra.slaw_ = tmp;
  }

  void Reset(slaw s) {
    SlawHandle victim(s);
    Swap(victim);
  }

  SlawHandle Dup() const { return SlawHandle(slaw_dup(Borrow())); }

 private:
  slaw slaw_;
};
}

#endif
