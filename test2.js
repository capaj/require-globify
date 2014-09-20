var fs = require('fs');
var browserify = require('browserify');

var glob = require('glob');
var globRequireTransform = require('./index');

var bundlePath = './test/basic/bundle.js';
var stream = browserify({
	entries: require.resolve('./test/basic/main.js')
}).transform(globRequireTransform).bundle().pipe(fs.createWriteStream(bundlePath));