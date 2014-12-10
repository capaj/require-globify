var fs = require('fs');
var browserify = require('browserify');
var through = require('through2');
var globRequireTransform = require('./../index');
var transformTools = require('browserify-transform-tools');

describe('basic glob replacement', function() {
	it('should have both test tokens when bundled', function(done) {

		var data = '';
		browserify({
			entries: require.resolve('./hash/main.js')
		}).transform(globRequireTransform).bundle().pipe(through(function(buf, enc, cb) {
			data += buf;
			cb();
		}, function(cb) {
			var err;
			if (!(data.indexOf('test token1') !== -1 && data.indexOf('test token1') !== -1)) {
				err = new Error('expected the bundle to include both test tokens');
			}
			if (!(data.indexOf('test token3') === -1 && data.indexOf('test token4') === -1)) {
				err = new Error('expected the bundle to NOT include commented out files');
			}

			cb();
			done(err);
		}));
	});

	it('should not include itself when glob expression includes itself', function(done) {
		var data = '';
		browserify({
			entries: require.resolve('./hash/self-exclusion/module.js')
		}).transform(globRequireTransform).bundle().pipe(through(function(buf, enc, cb) {
			data += buf;
			cb();
		}, function(cb) {
			var err;
			if (data.indexOf('module.js') !== -1) {
				err = new Error('expected this require call to be skipped');
			}

			cb();
			done(err);
		}));
	});
	
	it('should include the extensions of files if the configuration is set so', function(done) {
		var data = '';
		browserify({
			entries: require.resolve('./hash/include-exts/module.js')
		}).transform(globRequireTransform).bundle().pipe(through(function(buf, enc, cb) {
			data += buf;
			cb();
		}, function(cb) {
			var err;
			if (data.indexOf('"1.js":') === -1) {
				err = new Error('expected extension to be included in "1.js":');
			} else if (data.indexOf('require("./1.js")') === -1) {
				err = new Error('expected extension to be included in require("./1.js")');
			} else if (data.indexOf('"2.js":') === -1) {
				err = new Error('expected extension to be included in "2.js":');
			} else if (data.indexOf('require("./2.js")') === -1) {
				err = new Error('expected extension to be included in require("./2.js")');
			}

			cb();
			done(err);
		}));
	});
	
	it('should not include the extensions of files if the configuration is set so', function(done) {
		var data = '';
		browserify({
			entries: require.resolve('./hash/dont-include-exts/module.js')
		}).transform(globRequireTransform).bundle().pipe(through(function(buf, enc, cb) {
			data += buf;
			cb();
		}, function(cb) {
			var err;
			if (data.indexOf('"1":') === -1) {
				err = new Error('expected no extension in "1":');
			} else if (data.indexOf('require("./1")') === -1) {
				err = new Error('expected no extension in require("./1")');
			} else if (data.indexOf('"2":') === -1) {
				err = new Error('expected no extension in "2":');
			} else if (data.indexOf('require("./2")') === -1) {
				err = new Error('expected no extension in require("./2")');
			}
			if (data.indexOf('"1.js":') !== -1) {
				err = new Error('unexpected extension in "1.js":');
			} else if (data.indexOf('require("./1.js")') !== -1) {
				err = new Error('unexpected extension in require("./1.js")');
			} else if (data.indexOf('"2.js":') !== -1) {
				err = new Error('unexpected extension in "2.js":');
			} else if (data.indexOf('require("./2.js")') !== -1) {
				err = new Error('unexpected extension in require("./2.js")');
			}

			cb();
			done(err);
		}));
	});
	
	it('should not include the extensions of files by default', function(done) {
		var data = '';
		browserify({
			entries: require.resolve('./hash/self-exclusion/module.js')
		}).transform(globRequireTransform).bundle().pipe(through(function(buf, enc, cb) {
			data += buf;
			cb();
		}, function(cb) {
			var err;
			if (data.indexOf('"1":') === -1) {
				err = new Error('expected no extension in "1":');
			} else if (data.indexOf('require("./1")') === -1) {
				err = new Error('expected no extension in require("./1")');
			} else if (data.indexOf('"2":') === -1) {
				err = new Error('expected no extension in "2":');
			} else if (data.indexOf('require("./2")') === -1) {
				err = new Error('expected no extension in require("./2")');
			}
			if (data.indexOf('"1.js":') !== -1) {
				err = new Error('unexpected extension in "1.js":');
			} else if (data.indexOf('require("./1.js")') !== -1) {
				err = new Error('unexpected extension in require("./1.js")');
			} else if (data.indexOf('"2.js":') !== -1) {
				err = new Error('unexpected extension in "2.js":');
			} else if (data.indexOf('require("./2.js")') !== -1) {
				err = new Error('unexpected extension in require("./2.js")');
			}

			cb();
			done(err);
		}));
	});

});

