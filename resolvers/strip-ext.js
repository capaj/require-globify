module.exports = function(base, files, config) {
  var key, newKey;
  // contains map of stripped keys
  var conflicts = {};
  for (var file in files) {
    key = files[file];
    if (files.hasOwnProperty(key)) {
      newKey = key.substr(0, key.length - path.extname(key).length);
      // if already file with same stripping
      if (newKey in conflicts) {
        // check if first conflict
        if (conflicts[newKey] !== false) {
          // revert previous file stripping
          files[conflicts[newKey][0]] = conflicts[newKey][1];
          conflicts[newKey] = false;
        }
      } else {
        // strip key
        files[file] = newKey;
        // remember for possible later conflicts
        conflicts[newKey] = [file, key];
      }
    }
  }
  return files;
}
