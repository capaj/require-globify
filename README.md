require-globify
===============

[![Build Status](https://travis-ci.org/capaj/require-globify.svg?branch=develop)](https://travis-ci.org/capaj/require-globify)
[![Dependency Status](https://david-dm.org/capaj/require-globify.svg)](https://david-dm.org/capaj/require-globify) [![devDependency Status](https://david-dm.org/capaj/require-globify/dev-status.svg)](https://david-dm.org/capaj/require-globify#info=devDependencies)

Transform for browserify, which allows to require files with globbing expressions.

## Installation

[![require-globify](https://nodei.co/npm/require-globify.png?small=true)](https://nodei.co/npm/require-globify)

## Usage

``` bash
browserify -t require-globify entry.js > bundle.js
```

## Example

The transform is triggered by adding an additional parameter to the classic require() call.
```javascript
// just expand to multiple require calls, one for each matched file
require('./includes/*.js', {mode: 'expand'});

// return an object that maps each matched path to it's require() call
var hash = require('./includes/*.js', {mode: 'hash'});
```

## Interface
The second parameter to require must be an object and supports the following keys:

### mode *[required]*
  Possible values are
  - `'expand'`: replaces the call with multiple calls, one for each match.

  This replaces the option `glob: true` in *<1.2.0*.

  - `'hash'`: replaces the call with an object.

  Every matched file is represented by an identifier as the key and it's respective require call as the value. The identifiers can be tweaked with other options.
  This replaces the option `hash: true` in *<1.2.0*.

### ext *[optional, default:false]*
  This option sets if the file extension should be included when determining the identifier of a file.

### options *[optional, default:{}]*
  This allows options to be provided to [node-glob](https://www.npmjs.com/package/glob), which is used internally to find matching files.

### glob *[deprecated]*
  This option is replaced by `mode: 'expand'`, but remains supported until version 2.\*.\*

### hash *[deprecated]*
  This option is replaced by `mode: 'hash'`, but remains supported until version 2.\*.\*


## Credits
Original concept from Jiří špác, completely reimplemented by Adriaan Callaerts([@call-a3](https://github.com/call-a3)).
Hashing with paths implemented by Pat Collins.


## License
[MIT](http://github.com/capaj/require-globify/blob/master/LICENSE)


## Changelog
 - 1.2.0: Added mode feature, pass-through options for node-glob and multiple bugfixes
 - 1.1.0: Added hashing with path.
 - 1.0.*: Bugfixes.
 - 1.0.0: Rewrite based on browserify-transform-tools.
 - 0.*  : Base implementation by Jiří špác([@capaj](https://github.com/capaj)).
