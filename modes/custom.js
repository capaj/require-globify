module.exports = function(base, files, config) {
  if (files.length === 0) {
    return '';
  }
  return files.reduce(
    function(acc, file, idx, arr) {
      config.template = config.template.replace(new RegExp('{file}', 'g'), file);
      return (acc ? acc + ";" : "") + config.template;
    }, false);
};