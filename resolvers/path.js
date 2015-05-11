var path = require('path');

module.exports = function(base, files, config) {
  var keys, key;

  keys = Object.keys(files);
  for (var i=0, l=keys.length, key=keys[i]; i<l; key=keys[++i]) {
    files[key] = path.relative(base, path.resolve(base, key)).replace(/\\/g, '/');
  }
  return files;
}
