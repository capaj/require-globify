require-globify
===============

[![Build Status](https://travis-ci.org/call-a3/require-globify.svg?branch=develop)](https://travis-ci.org/call-a3/require-globify)
[![Dependency Status](https://david-dm.org/call-a3/require-globify.svg)](https://david-dm.org/call-a3/require-globify) [![devDependency Status](https://david-dm.org/call-a3/require-globify/dev-status.svg)](https://david-dm.org/call-a3/require-globify#info=devDependencies)

transform for browserify, which allows to require files with globbing expressions.

You can add an extra parameter to the classic require() like this:

```javascript
require('./scripts/*.js', {glob: true});

var hash = require('./scripts/*.js', {hash: true});

var hashWithExtensions = require('./scripts/*.js', {hash: true, ext: true});
```

which is then transformed into the following if the folder './scripts/' contains the files 'abc.js' and 'def.js'

```javascript
require('./scripts/abc.js');
require('./scripts/def.js');

var hash = {"abc": require('./scripts/abc.js'),"def": require('./scripts/def.js')};

var hashWithExtensions = {"abc.js": require('./scripts/abc.js'),"def.js": require('./scripts/def.js')};
```

Transform will generate classic require() calls before browserify is run.