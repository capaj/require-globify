prefix = require('./reduce-prefix.js');
postfix = require('./reduce-postfix.js');

module.exports = function(base, files, config) {
  prefix(base, files, config);
  postfix(base, files, config);
  return files;
}
