require-globify
===============

[![Build Status](https://travis-ci.org/capaj/require-globify.svg?tag=1.0.3)](https://travis-ci.org/capaj/require-globify)
[![Dependency Status](https://david-dm.org/capaj/require-globify.svg)](https://david-dm.org/capaj/require-globify) [![devDependency Status](https://david-dm.org/capaj/require-globify/dev-status.svg)](https://david-dm.org/capaj/require-globify#info=devDependencies)

Transform for browserify, which allows to require files with globbing expressions.

## Installation

[![require-globify](https://nodei.co/npm/require-globify.png?mini=true)](https://nodei.co/npm/require-globify)

## Usage

``` bash
browserify -t require-globify entry.js > bundle.js
```

## Example

You can add an extra parameter to the classic require() like this:

```javascript
require('./scripts/*.js', {glob: true});

var hash = require('./scripts/*.js', {hash: true});

var hashWithExtensions = require('./scripts/*.js', {hash: true, ext: true});

var hashWithPaths = require('./**/*.js', {hash: 'path'});

var hashWithExtensionsAndPaths = require('./**/*.js', {hash: 'path', ext: true});
```

which is then transformed into the following if the folder './scripts/' contains the files 'abc.js' and 'def.js'

```javascript
require('./scripts/abc.js');
require('./scripts/def.js');

var hash = {"abc": require('./scripts/abc.js'),"def": require('./scripts/def.js')};

var hashWithExtensions = {"abc.js": require('./scripts/abc.js'),"def.js": require('./scripts/def.js')};

var hashWithPaths = {"./scripts/abc": require('./scripts/abc.js'),"./scripts/def": require('./scripts/def.js')};

var hashWithExtensionsAndPaths = {"./scripts/abc.js": require('./scripts/abc.js'),"./scripts/def.js": require('./scripts/def.js')};
```

Transform will generate classic require() calls before browserify is run.

## Credits
Original concept from Jiří špác, completely reimplemented by Adriaan Callaerts.

## License
[MIT](http://github.com/capaj/require-globify/blob/master/LICENSE)
