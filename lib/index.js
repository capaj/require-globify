var glob = require('glob');
var path = require('path');
var fs   = require('fs');
var resolvers = {'../resolvers/path.js': require('../resolvers/path.js'),'../resolvers/reduce-postfix.js': require('../resolvers/reduce-postfix.js'),'../resolvers/reduce-prefix.js': require('../resolvers/reduce-prefix.js'),'../resolvers/reduce.js': require('../resolvers/reduce.js'),'../resolvers/strip-ext.js': require('../resolvers/strip-ext.js')};

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

    // if the config object doesn't match our specs, abort
    if (typeof config.mode === 'undefined') {
      return done();
    }

    // set default key option to ["reduce"]
    config.key = config.key || ["reduce"];
    if (!Array.isArray(config.key)) {
      config.key = [config.key];
    }

    // backwards compatibility for glob and hash options, replaced by mode
    if (config.glob) {
      config.mode = "expand";
    } else if (config.hash) {
      config.mode = "hash";
      if (config.hash === "path") {
        config.key = ["path"];
      }
    }

    // backwards compatibility for ext option
    if (config.key.indexOf('path') !== -1) {
      (function() {
        var sei = config.key.indexOf('strip-ext');
        if (typeof config.ext !== 'undefined' && config.ext) {
          // ensure strip-ext is NOT in the key
          if (sei !== -1) {
            config.key.splice(sei, 1);
          }
        } else if (sei === -1){
          // ensure strip-ext IS in the key
          config.key.push('strip-ext');
        }
      })();
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

      try {

        // handle the special case where no matches were found
        if (files.length === 0) {
          switch (config.mode) {
            case "expand":
              return done(null, "");
            case "hash":
              return done(null, "{}");
            default:
              throw "Unknown mode cannot handle no-files-matched";
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
          case "hash":
            // wrap in anonymous function to have a private scope
            return done(null, (function() {
              var hash = {};
              for (var i=0, l=files.length, file=files[i]; i<l; file=files[++i]) {
                hash[file] = file;
              }
              for (var i=0, l=config.key.length, key=config.key[i]; i<l; key=config.key[++i]) {
                if (Object.hasOwnProperty(resolvers, key)) {
                  hash = resolvers[key](opts.file, hash, config);
                } else {
                  throw "Unknown key resolver: " + key;
                }
              }
              return "{" + files.reduce(
                function(acc, file, idx, arr) {
                  return (acc ? acc + "," : "") +
                    "'" + hash[file] + "': " +
                    "require('" + file + "')";
                }, false) + "}";
            })());
          default:
            throw "Unknown mode cannot handle matches";
        }

      } catch (err) {
        return done(err);
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
