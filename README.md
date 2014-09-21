require-globify
===============

transform for browserify, which allows to require files with globbing expressions

instead of classic require(), call requireGlob like this:

```javascript
requireGlob('./scripts/*.js')
```

Transform will generate classic require() calls before browserify is run.

Todo: be able to return hash out of globbed modules-so far you can only require files so that they are loaded. 
