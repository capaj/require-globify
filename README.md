require-globify
===============

[![Build Status](https://travis-ci.org/call-a3/require-globify.svg?branch=develop)](https://travis-ci.org/call-a3/require-globify)
[![Dependency Status](https://david-dm.org/call-a3/require-globify.svg)](https://david-dm.org/call-a3/require-globify) [![devDependency Status](https://david-dm.org/call-a3/require-globify/dev-status.svg)](https://david-dm.org/call-a3/require-globify#info=devDependencies)

transform for browserify, which allows to require files with globbing expressions

instead of classic require(), call requireGlob or require-glob like this:

```javascript
requireGlob('./scripts/*.js');
require-glob('./scripts/*.js');
```

Transform will generate classic require() calls before browserify is run.

Todo: be able to return hash out of globbed modules-so far you can only require files so that they are loaded. 
