var transformTools = require('browserify-transform-tools');
var glob = require('glob');
var path = require('path');

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
        for (var fi = 0, fl = files.length; fi < fl; fi++) {
          if (path.resolve(cwd, files[fi]) !== opts.file) {
            modules.push(files[fi]);
          }
        }
        if ((typeof optsObj.hash !== "undefined" && optsObj.hash !== null && optsObj.hash !== false)) {
          for (var mi = 0, mil = modules.length; mi < mil; mi++) {
            var module = modules[mi];
            var hashProp = optsObj.ext ? path.basename(module) : path.basename(module, path.extname(module));
            modules[mi] = '"' + hashProp + '": require(\'' + module + '\')';
          }
          replacement = '{' + modules.join(', ') + '}';
        } else {
          replacement = 'require(\'' + modules.join('\');\nrequire(\'') + '\')';
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