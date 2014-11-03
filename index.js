var transformTools = require('browserify-transform-tools');
var glob = require('glob');
var path = require('path');

module.exports = transformTools.makeRequireTransform('require-globify', {
    jsFilesOnly: true,
    evaluateArguments: true
  },
  function (args, opts, done) {
    if (typeof args[1] !== 'undefined' && (args[1].hash || args[1].glob)) {
      var cwd = path.dirname(opts.file),
        globPattern = args[0],
        files = glob.sync(globPattern, {
          cwd: cwd
        });
      if (files.length !== 0 && files.length > 0) {
        var modules = [];
        for (var fi = 0, fl = files.length; fi < fl; fi++) {
          if (path.resolve(cwd, files[fi]) !== opts.file) {
            modules.push(files[fi]);
          }
        }
        if ((typeof args[1].hash !== "undefined" && args[1].hash !== null && args[1].hash !== false)) {
          for (var mi = 0, mil = modules.length; mi < mil; mi++) {
            modules[mi] = '"' + (args[1].ext ? path.basename(modules[mi]) : path.basename(modules[mi], path.extname(modules[mi]))) + '": require(\'' + modules[mi] + '\')';
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
  });