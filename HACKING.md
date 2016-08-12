# hacking

## build

See the note about "g-speak-version" under the "usage" section above.  Consult
g-seek.py if things get rocky.

``` bash
$ npm install -g node-gyp
$ npm install
$ node-gyp configure
$ node-gyp build
```

for a Debug build, pass `--debug` to `node-gyp configure` or `node-gyp build`.
to load the Debug version of the addon at runtime, set the GELATIN_DEBUG
environment variable.

to build against another g-speak, either edit `g-speak.dat` or:

``` bash
$ node-gyp configure --g_speak_home=/opt/oblong/g-speakX.Y \
    --yobuild_home=/opt/oblong/deps-BITS-VERSION
```

## test

``` bash
$ npm test
$ npm run test-debug # test with Debug build
```

## rtags

this is a tricky wicket, because `node-gyp build` falls on its face if you ask
`node-gyp configure` for ninja output, and `node-gyp configure` doesn't let you
use an alternative build directory.  see
<https://github.com/nodejs/node-gyp/issues/486>.

as a kludge, run the included `rtags-reindex.sh` script whenever you add a new
source file to `src/` to re-index the project.  the script will `rm -rf` the build
directory, be wary!

``` bash
./rtags-reindex.sh .
```

## style

This project uses [clang-format][] for C++ code formatting and [jscs][] to
enforce JavaScript code style.  Where possible, other style decisions
(capitalization, naming, etc.) should roughly imitate Node's and/or v8's
styles.

[clang-format]: <http://clang.llvm.org/docs/ClangFormat.html>
[jscs]: <http://jscs.info/>
