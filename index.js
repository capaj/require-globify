var glob = require('glob');
var path = require('path');
var fs   = require('fs');

module.exports = require('browserify-transform-tools').makeRequireTransform(
  'require-globify',
  {
    jsFilesOnly: true,
    evaluateArguments: true
  },
  function (args, opts, done) {
    // args: args passed to require()
    // opts: opts used by browserify for the current file
    // done: browserify callback

    var config, pattern, globOpts;

    // only trigger if require was used with exactly 2 params
    if (args.length !== 2) {
      return done();
    }

    // get the second param to require as our config
    config = args[1];

    // backwards compatibility for glob and hash options, replaced by mode
    if (config.glob) {
      config.mode = "expand";
    } else if (config.hash) {
      config.mode = "hash";
    }

    // if the config object doesn't match our specs, abort
    if (typeof config.mode === 'undefined') {
      return done();
    }

    // take the first param to require as pattern
    pattern = args[0];

    // use any additional options given
    globOpts = config.options || {};

    // if no override; set the cwd for glob to the dirname of the current file
    globOpts.cwd = globOpts.cwd || path.dirname(opts.file);
    // only match files
    globOpts.nodir = true;

    glob(pattern, globOpts, function(err, files) {
      // if there was an error with glob, abort here
      if (err) {
        return done(err);
      }

      // handle the special case where no matches were found
      if (files.length === 0) {
        switch (config.mode) {
          case "expand":
            return done(null, "");
            break;
          case "hash":
            return done(null, "{}");
          default:
            return done("Unknown mode cannot handle no-files-matched");
        }
      }

      // sort files to ensure consistent order upon multiple runs
      files.sort();

      // handle files based on current mode
      // console.log(files);
      switch (config.mode) {
        case "expand":
          return done(null, files.reduce(
            function(acc, file, idx, arr) {
              return (acc ? acc + ";" : "") + "require('" + file + "')";
            }, false)
          );
          break;
        case "hash":
          return done("Unimplemented");
          break;
        default:
          return done("Unknown mode cannot handle matches");
      }
    });


    // var optsObj = args[1];
    // if (typeof  optsObj !== 'undefined' && (optsObj.hash || optsObj.glob)) {
    //   var cwd = path.dirname(opts.file),
    //     globPattern = args[0],
    //     files = glob.sync(globPattern, {
    //       cwd: cwd
    //     });
    //   if (files.length !== 0 && files.length > 0) {
    //     var modules = [];
    //     var replacement;
    //     var filePath;
    //     for (var fi = 0, fl = files.length; fi < fl; fi++) {
    //       filePath = path.resolve(cwd, files[fi]);
    //       if (filePath !== opts.file && !fs.statSync(filePath).isDirectory()) {
    //         modules.push(files[fi]);
    //       }
    //     }
    //     if ((typeof optsObj.hash !== "undefined" && optsObj.hash !== null && optsObj.hash !== false)) {
    //       var hashKey, modulePath;
    //       for (var mi = 0, mil = modules.length; mi < mil; mi++) {
    //         var mod = modules[mi];
    //         if (optsObj.hash === 'path') {
    //           hashKey = optsObj.ext ? mod : mod.slice(0, mod.lastIndexOf(path.extname(mod)));
    //           modulePath = hashKey;
    //         } else if (optsObj.hash === true) {
    //           hashKey = optsObj.ext ? path.basename(mod) : path.basename(mod, path.extname(mod));
    //           hashKeyExt = path.basename(mod);
    //           modulePath = path.dirname(mod) + '/' + hashKeyExt;
    //         }
    //         modules[mi] = '"' + hashKey + '": require("' + modulePath + '")';
    //       }
    //       replacement = '{' + modules.join(', ') + '}';
    //     } else {
    //       replacement = 'require("' + modules.join('");\nrequire("') + '")';
    //     }
    //     done(null, replacement);
    //   } else {
    //     done('Glob expression "' + globPattern + '" couldn\'t find any files');
    //   }
    // } else {
    //   done();
    // }
  }
);
