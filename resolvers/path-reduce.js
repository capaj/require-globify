var path = require('path');

module.exports = function(base, files, config) {
  var key, keys, common;

  if (Object.keys(files).length === 1) {
    files[file] = path.basename(file, path.extname(file));
    return files;
  }

  keys = [];
  for (var file in files) {
    keys.push(files[file].split('/'));
  }

  common = 0;
  while(keys.every(function(key) {
    return key[common] === keys[0][common];
  })) {
    common++;
  }
  common = keys[0].slice(0, common).join('/') + '/';

  for (var file in files) {
    files[file] = files[file].substring(common.length);
  }
  return files;
}
