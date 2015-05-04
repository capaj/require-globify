module.exports = function(base, files, config) {
  var key, keys, common;

  if (Object.keys(files).length === 1) {
    var file = Object.keys(files)[0];
    var path = require('path');
    files[file] = path.basename(file, path.extname(file));
    return files;
  }

  keys = [];
  for (var file in files) {
    keys.push(files[file]);
  }

  common = keys[0].substr(0, 1);
  while(keys.every(function(key) {
    return key.indexOf(common) === 0;
  })) {
    common += keys[0].substr(common.length, 1);
  }
  common = common.substr(0, common.length-1);

  for (var file in files) {
    files[file] = files[file].substr(common.length);
  }
  return files;
}
