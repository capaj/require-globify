var fs = require('fs');
var browserify = require('browserify');
var through = require('through2');

describe('basic glob replacement', function() {
	it('should have both test tokens when bundled', function(done) {
		var globRequireTransform = require('./../index');

		var data = '';
		browserify({
			entries: require.resolve('./basic/main.js')
		}).transform(globRequireTransform).bundle().pipe(through(function(buf, enc, cb) {
			data += buf;
			cb();
		}, function(cb) {
			var err;
			if (!(data.indexOf('test token1') !== -1 && data.indexOf('test token1') !== -1)) {
				err = new Error('expected the bundle to include both test tokens');
			}

			cb();
			done(err);
		}));
	});


});

