var fs = require('fs');

require('browserify-transform-tools').runTransform(
  require('./lib/index.js'),
  './src/index.js',
  { content: fs.readFileSync('./src/index.js') },
  function(err, data) {
    if (err) {
      console.error(err);
      return;
    }
    fs.writeFileSync('./lib/index.js', data);
  });
