var fs = require('fs');
var browserify = require('browserify');
var through = require('through2');
var globRequireTransform = require('./../index');
var transformTools = require('browserify-transform-tools');

describe('hash recursive glob replacement', function() {
	it('should include the relative paths of files if the configuration is set so', function(done) {
		var data = '';
		browserify({
			entries: require.resolve('./hash-recursive/path-dont-include-exts/module.js')
		}).transform(globRequireTransform).bundle().pipe(through(function(buf, enc, cb) {
			data += buf;
			cb();
		}, function(cb) {
			var err;
			if (data.indexOf('"./1": require("./1")') === -1) {
				err = new Error('expected relative path to be included in "./1":');
			}
			if (data.indexOf('"./2": require("./2")') === -1) {
				err = new Error('expected relative path to be included in "./2":');
			}
			if (data.indexOf('"./3/3": require("./3/3")') === -1) {
				err = new Error('expected relative path to be included in "./3/3":');
			}
			if (data.indexOf('"./4/4/4/4": require("./4/4/4/4")') === -1) {
				err = new Error('expected relative path to be included in "./4/4/4/4":');
			}

			cb();
			done(err);
		}));
	});

	it('should include the relative paths and extensions of files if the configuration is set so', function(done) {
		var data = '';
		browserify({
			entries: require.resolve('./hash-recursive/path-include-exts/module.js')
		}).transform(globRequireTransform).bundle().pipe(through(function(buf, enc, cb) {
			data += buf;
			cb();
		}, function(cb) {
			var err;
			if (data.indexOf('"./1.js": require("./1.js")') === -1) {
				err = new Error('expected relative path to be included in "./1.js":');
			}
			if (data.indexOf('"./2.js": require("./2.js")') === -1) {
				err = new Error('expected relative path to be included in "./2.js":');
			}
			if (data.indexOf('"./3/3.js": require("./3/3.js")') === -1) {
				err = new Error('expected relative path to be included in "./3/3.js":');
			}
			if (data.indexOf('"./4/4/4/4.js": require("./4/4/4/4.js")') === -1) {
				err = new Error('expected relative path to be included in "./4/4/4/4.js":');
			}

			cb();
			done(err);
		}));
	});
});
