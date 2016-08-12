#!/bin/bash

set -e

# wipes your build directory, be wary!

if [[ -z "$1" || ! -d "$1" ]]; then
    echo "usage: $0 <path-to-project-root>" >&2
    exit 1
fi

PROJECT_ROOT="$1"

cd "$PROJECT_ROOT"
rc --delete-project "$(pwd)"
rm -rf build/
node-gyp configure -- -f ninja
# Have to cd into the build directory, or rc will fail.  `ninja -C
# build/Release -t commands` prints paths of source files relative to the build
# directory, so rc needs to run in the build directory for everything to match
# up.
pushd "$PROJECT_ROOT/build/Release" >/dev/null
# hack for https://github.com/Andersbakken/rtags/issues/601
ninja -t commands | grep -v '^if' | rc -c -
popd >/dev/null
echo 'sleeping until rc says rdm is done indexing...'
# This is a brutal hack.  I wish we could limit this by a path, so indexing of
# some other project's files doesn't make this wait for an unduly long time.
# I also with that we could ask the rc -c command above to block until rdm is
# done indexing only those files.
while [[ $(rc --is-indexing) -eq '1' ]]; do
    sleep 0.1 # non-portability alert!
done
rm -rf build/
