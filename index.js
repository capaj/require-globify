var transformTools = require('browserify-transform-tools');
var glob = require('glob');
var path = require('path');
var fs = require('fs');

module.exports = transformTools.makeRequireTransform('require-globify', {
    jsFilesOnly: true,
    evaluateArguments: true
  },
  function (args, opts, done) {
    var optsObj = args[1];
    if (typeof  optsObj !== 'undefined' && (optsObj.hash || optsObj.glob)) {
      var cwd = path.dirname(opts.file),
        globPattern = args[0],
        files = glob.sync(globPattern, {
          cwd: cwd
        });
      if (files.length !== 0 && files.length > 0) {
        var modules = [];
        var replacement;
        var filePath;
        for (var fi = 0, fl = files.length; fi < fl; fi++) {
          filePath = path.resolve(cwd, files[fi]);
          if (filePath !== opts.file && !fs.statSync(filePath).isDirectory()) {
            modules.push(files[fi]);
          }
        }
        if ((typeof optsObj.hash !== "undefined" && optsObj.hash !== null && optsObj.hash !== false)) {
          var hashKey, modulePath;
          for (var mi = 0, mil = modules.length; mi < mil; mi++) {
            var mod = modules[mi];
            if (optsObj.hash === 'path') {
              hashKey = optsObj.ext ? mod : mod.slice(0, mod.lastIndexOf(path.extname(mod)));
              modulePath = hashKey;
            } else if (optsObj.hash === true) {
              hashKey = optsObj.ext ? path.basename(mod) : path.basename(mod, path.extname(mod));
              modulePath = path.dirname(mod) + '/' + hashKey;
            }
            modules[mi] = '"' + hashKey + '": require("' + modulePath + '")';
          }
          replacement = '{' + modules.join(', ') + '}';
        } else {
          replacement = 'require("' + modules.join('");\nrequire("') + '")';
        }
        done(null, replacement);
      } else {
        done('Glob expression "' + globPattern + '" couldn\'t find any files');
      }
    } else {
      done();
    }
  }
);
