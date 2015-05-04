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

  common = keys[0].substr(-1);
  while(keys.every(function(key) {
    return key.lastIndexOf(common) === key.length - common.length;
  })) {
    common = keys[0].substr(-1-common.length);
  }
  common = common.substr(1);
  console.log('common = ' + common);

  for (var file in files) {
    files[file] = files[file].substring(0, files[file].length-common.length);
  }
  return files;
}
