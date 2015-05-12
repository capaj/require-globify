var resolvers = {
  'path-reduce': require('../resolvers/path-reduce'),
  'path': require('../resolvers/path'),
  'reduce-postfix': require('../resolvers/reduce-postfix'),
  'reduce-prefix': require('../resolvers/reduce-prefix'),
  'reduce': require('../resolvers/reduce'),
  'strip-ext': require('../resolvers/strip-ext')
};

module.exports = function(base, files, config) {
  var hash, i, l, file, resolve;

  if (files.length === 0) {
    return '{}';
  }

  // map every matched file using resolve
  hash = {};
  for (var i = 0, l = files.length, file = files[i]; i < l; file = files[++i]) {
    hash[file] = file;
  }

  for (var i = 0,
      l = config.resolve.length,
      resolve = config.resolve[i]; i < l; resolve = config.resolve[++i]) {
    if (typeof resolve !== 'function') {
      if (resolvers.hasOwnProperty(resolve)) {
        resolve = resolvers[resolve];
      } else {
        throw "Unknown key resolve: " + resolve;
      }
    }
    hash = resolve(base, hash, config);
  }


  // return object-mapped string
  return "{" + files.reduce(
    function(acc, file, idx, arr) {
      return (acc ? acc + "," : "") +
        "'" + hash[file].replace(/\\/g, '/') + "': " +
        "require('" + file + "')";
    }, false) + "}";

};
