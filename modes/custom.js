module.exports = function(base, files, config) {
  if (files.length === 0) {
    return '';
  }
  return files.reduce(
    function(acc, file, idx, arr) {
      var template = config.template.replace(new RegExp('{file}', 'g'), file);
      return (acc ? acc + ";" : "") + template;
    }, false);
};
