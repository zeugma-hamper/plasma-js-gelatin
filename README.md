# gelatin

libPlasma bindings/implementation for Node.js.  Work in progress.

[![npm version](https://badge.fury.io/js/gelatin.svg)](https://badge.fury.io/js/gelatin)

## g-speak version

Since it has a native component, gelatin requires the g-speak platform to be
installed wherever it's used.  At build/`npm install` time, the version of
g-speak used is determined this way:

1. If `GELATIN_G_SPEAK_HOME` is set in the environment, use that path to look
   up g-speak.  For example, `GELATIN_G_SPEAK_HOME=/opt/oblong/g-speak3.26 npm
   install` will build/link against g-speak 3.26 installed to /opt/oblong.
2. Otherwise, look up the most recent compatible version of g-speak in
   `/opt/oblong`.

## build dependencies

gelatin has these dependencies at build/`npm install` time:

* python3 and python2.7, for [node-gyp](https://github.com/nodejs/node-gyp#installation)
* oblong-loamX.Y
* oblong-plasmaX.Y

where X.Y is the g-speak version determined above.

Some older versions of g-speak require also, on Ubuntu 16.04:

* libjpeg-dev
* libpng12-dev
* libtiff5-dev

## runtime dependencies

At runtime, gelatin depends on:

* oblong-loamX.Y
* oblong-plasmaX.Y
* oblong-system-protistX.Y

where X.Y is the g-speak version used at build time.

The location of `peek` and `poke` binaries are found using the `G_SPEAK_HOME`
path computed in the [g-speak version](#g-speak-version) section.  This path
can be overridden at runtime by setting `GELATIN_G_SPEAK_HOME` in the
environment; useful if paths are relocated in a container or snap.

## examples

Check the `examples/` directory for some commented examples of using gelatin.
`examples/wandsplit.js` is quite practical (inspired by a real-world use case)
and uses the most gelatin features of the examples.


```js
const util = require('util');
const peek = require('gelatin').peek;

const pool = process.argv[2];

function main() {
  if (!pool) {
    console.error('pool argument required.');
    process.exitCode = 1;
    return;
  }

  const p = peek(pool);

  p.on('data', (protein) => {
    console.log('metabolized protein with descrips:', protein.descrips);
    if (protein.descrips.indexOf('hangup') >= 0) {
      p.end();
    }
  });
  p.on('error', (err) => {
    console.error(`peek error: ${util.inspect(err)}`);
  });

  console.log('now deposit/poke a protein to pool', pool);
}

main();
```


## API documentation

To generate API documentation from the source repo:

```
npm install
npm run doc
```

The documentation will be available at `doc/out/index.html`

## type conversions

Conversions are defined for converting JavaScript values to Slaw values, and
for converting Slaw values to JavaScript's values.  For JavaScript's primitive
types, these are:

| Javascript type/value            | Slaw type/value                |
|----------------------------------|--------------------------------|
| null (`null`)                    | (null)                         |
| undefined (`void 0`)             | (null)                         |
| boolean (`true`)                 | boolean                        |
| number (`-5` or `23` or `4.56`)  | unt32/int32/float64 (see note) |
| string (`"hello world"`)         | string                         |

Numeric conversions are a pain because, where slaw has a plethora of numeric
types, JavaScript (from a high-level perspective) has just one number type:
double-precision float.  JavaScript does, under the hood, support `int32_t` and
`uint32_t` representations of certain numbers (see, for example
[](http://www.ecma-international.org/ecma-262/5.1/#sec-11.7)), and when a
JavaScript number is represented this way its slaw conversion is to the
appropriate slaw number type.  But it's not always obvious which representation
a JavaScript number has, so be careful.  Note also that conversions from slaw
`int64`/`unt64` to JavaScript number values *may be lossy*.

For object types and the special `Slaw.nil` value, the conversions are:

| Javascript type/value                                | Slaw type/value |
|------------------------------------------------------|-----------------|
| Map (`new Map([["hello", 123]])`)                    | map             |
| Array (`[ true, false ]`)                            | list            |
| gelatin.Slaw.nil (`gelatin.Slaw.nil`)                | nil             |
| gelatin.Vect (`new gelatin.Vect([0.0, 1.0, 0.])`)    | v3float64       |
| gelatin.Vect2 (`new gelatin.Vect2([0.0, 1.0])`)      | v2float64       |
| gelatin.Vect4 (`new gelatin.Vect4([0, 1, 2, 3])`)    | v4float64       |
| gelatin.Protein (`new gelatin.Protein(["foo"], {})`) | protein         |
| Object (other) (`{foo: 123}`) (note: only *from* JS) | map             |

Composite values like Maps and Arrays convert each of their elements to slaw.
For convenience, it's possible to create a slaw map using a "Plain Old
JavaScript Object", but a slaw map always converts to a JavaScript Map value.

## platform compatibility

gelatin officially supports the Node.JS v4.2 "Argon" LTS release on Linux and
OS X/macOS.  Unofficially, gelatin also tries its best to support the latest
Node versions released through Homebrew for OS X/macOS.

## plasma-js-bridge compatibility

Limited plasma-js-bridge compatibility is offered.  `peek()` accepts an
optional callback argument, and a `gelatin/compat` module is provided for
plasma-js-bridge compatible functions such as `oldestIndex` and `newest`.
Access the compat module like so:

    const plas = require('gelatin/compat');

## copyright & license

Copyright (c) 2016 Oblong Industries, Inc. Code released under
[the MIT license](LICENSE.txt).
