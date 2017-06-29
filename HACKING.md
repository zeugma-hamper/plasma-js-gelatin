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

## how to publish

Steps to publish a release:

0. Have a clean working tree.  Buy a beer, glass of wine, cup of coffee, or
   another (legal) psychoactive drug for each of your colleagues who work on
   gelatin, to trick them into not pushing to master while you're doing this.
1. Run `npm pack`.  Inspect the resulting tarball (`tar -tzf foo.tgz`) to
   verify that all the files which should be there (C++, JS, gyp, etc.) are
   there, and files which shouldn't be there (tests, documentation, etc.)
   ain't.  The files included in the package are whitelisted in
   the [`files`][npm-files] field of `package.json`.
2. Move the tarball to a temporary location, extract it, `cd` into `package/` and
   check that `npm install` succeeds.
3. Run [`npm version <newversion>`] to increment the version number and tag the
   latest commit.
4. Assuming you have git remotes `origin` (for the internal repo) and `github`
   (for the public repo), run these commands: `git push --atomic --tags origin
   master` and `git push --atomic --tags github master`.  This pushes the
   master branch and tag you just made to each remote.
5. If anything in step (4) failed, abort and consult the rest of the gelatin
   team.  Do not proceed!
6. Finally, run `npm publish`.

See also
["Before Publishing: Make Sure Your Package Installs and Works"][before-pub]
from the NPM docs.

[clang-format]: <http://clang.llvm.org/docs/ClangFormat.html>
[jscs]: <http://jscs.info/>
[npm-files]: <https://docs.npmjs.com/files/package.json#files>
[before-pub]: <https://docs.npmjs.com/misc/developers#before-publishing-make-sure-your-package-installs-and-works>
[npm-version]: <https://docs.npmjs.com/cli/version>
