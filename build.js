var fs = require('fs');

['index.js'].forEach(function(file) {
  require('browserify-transform-tools').runTransform(
    require('./lib/index.js'),
    './src/' + file,
    { content: fs.readFileSync('./src/' + file) },
    function(err, data) {
      if (err) {
        console.error(err);
        return;
      }
      fs.writeFileSync('./lib/' + file, data);
    });
});
