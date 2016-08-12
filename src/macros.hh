
// (c) oblong industries

#ifndef GELATIN_MACROS_HH
#define GELATIN_MACROS_HH

// Worse version of the try!() macro from Rust.
#define TRY_(expr)        \
  {                       \
    ob_retort t = (expr); \
    if (t < OB_OK) {      \
      return t;           \
    }                     \
  }

#define DISALLOW_COPY_AND_ASSIGN(KLASS) \
  KLASS(const KLASS &) = delete;        \
  KLASS &operator=(const KLASS &) = delete;

#endif
