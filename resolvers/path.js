module.exports = function(base, files, config) {
  var key;
  for (var file in files) {
    key = files[file];
    if (files.hasOwnProperty(key)) {
      files[file] = path.relative(base, key);
    }
  }
  return files;
}
