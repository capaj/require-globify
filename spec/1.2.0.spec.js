var expect = require('chai').expect;
var test = (function() {
	var transform = require('..');
	var path = require('path');
	var runTransform = require('browserify-transform-tools').runTransform;

	return function(location, content, checkData) {
		runTransform(
			transform,
			path.resolve(__dirname, location),
			{content: content},
			function(err, data) {
				expect(err).to.be.null;
				checkData(data);
			});
	}
})();

var compare = (function() {})();

describe('require-globify', function() {

	describe('comment handling', function() {

		it('should ignore require calls in singleline comments', function(done) {
			singleLine = [
				'// Should ignore the following line',
				'// require("./include/*", {mode: "expand"});'
			].join('\n');
			test(
				'./dummies/no-singleline-comments.js',
				singleLine,
				function(data) {
					expect(data).to.not.contain('./include/INCLUDED.js');
					expect(data).to.equal(singleLine);
					done();
				});
		});

		it('should ignore require calls in multiline comments', function(done) {
			multiLine = [
				'/*',
				' * Should ignore the following line',
				' * require("./include/*", {mode: "expand"});',
				' */'
			].join('\n');
			test(
				'./dummies/no-multiline-comments.js',
				multiLine,
				function(data) {
					expect(data).to.not.contain('./include/INCLUDED.js');
					expect(data).to.equal(multiLine);
					done();
				});
		});
	});

	// compare glob:true
	describe('mode: "expand"', function() {

		describe('without recursion', function() {

			it('should contain a file that matches the glob', function(done) {
				test(
					'./dummies/module.js',
					'require("./include/*", {mode: "expand"});',
					function(data) {
						expect(data).to.contain('./include/INCLUDED.js');
						expect(data).to.not.contain('./include/nesting/NESTED_INCLUDE.js');
						done();
					});
			});

			it('should remove itself if it doesn\'t match anything', function(done) {
				test(
					'./dummies/module.js',
					'require("./*", {mode: "expand"});',
					function(data) {
						expect(data).to.not.contain('./module.js');
						expect(data).to.not.match(/require\(\s?("")|('')\)/);
						done();
					});
			});

			it('should not contain itself, even if it matches the glob', function(done) {
				test(
					'./dummies/include/module.js',
					'require("./*", {mode: "expand"});',
					function(data) {
						expect(data).to.not.contain('./module.js');
						expect(data).to.contain('./INCLUDED.js');
						done();
					});
			});

			it('should be able to match non-js files', function(done) {
				test(
					'./dummies/module.js',
					'require("./template/*", {mode: "expand"});',
					function(data) {
						expect(data).to.not.contain('./module.js');
						expect(data).to.contain('./template/TEMPLATED.hbs');
						done();
					});
			});

		});

		describe('with recursion starting from current directory', function() {

				it('should contain a file that matches the glob', function(done) {
					test(
						'./dummies/module.js',
						'require("./**/*.js", {mode: "expand"});',
						function(data) {
							expect(data).to.contain('./include/INCLUDED.js');
							expect(data).to.contain('./include/nesting/NESTED_INCLUDE.js');
							expect(data).to.contain('./ignore/IGNORED.js');
							done();
						});
				});

				it('should pass on options to node-glob', function(done) {
					test(
						'./dummies/module.js',
						'require("./**/*.js", {mode: "expand", options: {ignore: \'*/ignore/**/*\'}});',
						function(data) {
							expect(data).to.contain('./include/INCLUDED.js');
							expect(data).to.contain('./include/nesting/NESTED_INCLUDE.js');
							expect(data).to.not.contain('./ignore/IGNORED.js');
							done();
						});
				});

				it('should remove itself if it doesn\'t match anything', function(done) {
					test(
						'./dummies/module.js',
						'require("./**/*.bogus", {mode: "expand"});',
						function(data) {
							expect(data).to.not.match(/require\(\s?("")|('')\)/);
							done();
						});
				});

				it('should not contain itself, even if it matches the glob', function(done) {
					test(
						'./dummies/include/module.js',
						'require("./*", {mode: "expand"});',
						function(data) {
							expect(data).to.not.contain('./module.js');
							expect(data).to.contain('./INCLUDED.js');
							done();
						});
				});

				it('should be able to match non-js files', function(done) {
					test(
						'./dummies/module.js',
						'require("./template/*", {mode: "expand"});',
						function(data) {
							expect(data).to.not.contain('./module.js');
							expect(data).to.contain('./template/TEMPLATED.hbs');
							done();
						});
				});

		});

		describe('with recursion starting from an ancestor directory', function() {

					it('should contain a file that matches the glob', function(done) {
						test(
							'./dummies/include/module.js',
							'require("../**/*.js", {mode: "expand"});',
							function(data) {
								expect(data).to.contain('../include/INCLUDED.js');
								expect(data).to.contain('../include/nesting/NESTED_INCLUDE.js');
								expect(data).to.contain('../ignore/IGNORED.js');
								expect(data).to.not.contain('../template/TEMPLATED.hbs');
								done();
							});
					});

					it('should pass on options to node-glob', function(done) {
						test(
							'./dummies/include/module.js',
							'require("../**/*.js", {mode: "expand", options: {ignore: \'*/ignore/**/*\'}});',
							function(data) {
								expect(data).to.contain('../include/INCLUDED.js');
								expect(data).to.contain('../include/nesting/NESTED_INCLUDE.js');
								expect(data).to.not.contain('../ignore/IGNORED.js');
								expect(data).to.not.contain('../template/TEMPLATED.hbs');
								done();
							});
					});

					it('should remove itself if it doesn\'t match anything', function(done) {
						test(
							'./dummies/include/module.js',
							'require("../**/*.bogus", {mode: "expand"});',
							function(data) {
								expect(data).to.not.match(/require\(\s?("")|('')\)/);
								done();
							});
					});

					it('should not contain itself, even if it matches the glob', function(done) {
						test(
							'./dummies/include/nesting/module.js',
							'require("../*", {mode: "expand"});',
							function(data) {
								expect(data).to.not.contain('./module.js');
								expect(data).to.contain('../INCLUDED.js');
								done();
							});
					});

					it('should be able to match non-js files', function(done) {
						test(
							'./dummies/include/module.js',
							'require("../template/*", {mode: "expand"});',
							function(data) {
								expect(data).to.not.contain('./module.js');
								expect(data).to.contain('../template/TEMPLATED.hbs');
								done();
							});
					});

		});

	});

	// compare hash:true
	describe('mode: "hash"', function() {

		describe('without recursion', function() {

			it('should contain a file that matches the glob', function(done) {
				test(
					'./dummies/module.js',
					'var deps = require("./include/*", {mode: "hash"});',
					function(data) {
						expect(data).to.contain('./include/INCLUDED.js');
						expect(data).to.not.contain('./include/nesting/NESTED_INCLUDE.js');
						done();
					});
			});

			it('should remove itself if it doesn\'t match anything', function(done) {
				test(
					'./dummies/module.js',
					'var deps = require("./*", {mode: "hash"});',
					function(data) {
						expect(data).to.not.contain('./module.js');
						expect(data).to.not.match(/require\(\s?("")|('')\)/);
						done();
					});
			});

			it('should not contain itself, even if it matches the glob', function(done) {
				test(
					'./dummies/include/module.js',
					'var deps = require("./*", {mode: "hash"});',
					function(data) {
						expect(data).to.not.contain('./module.js');
						expect(data).to.contain('./INCLUDED.js');
						done();
					});
			});

			it('should be able to match non-js files', function(done) {
				test(
					'./dummies/module.js',
					'var deps = require("./template/*", {mode: "hash"});',
					function(data) {
						expect(data).to.not.contain('./module.js');
						expect(data).to.contain('./template/TEMPLATED.hbs');
						done();
					});
			});

		});

		describe('with recursion starting from current directory', function() {

				it('should contain a file that matches the glob', function(done) {
					test(
						'./dummies/module.js',
						'var deps = require("./**/*.js", {mode: "hash"});',
						function(data) {
							expect(data).to.contain('./include/INCLUDED.js');
							expect(data).to.contain('./include/nesting/NESTED_INCLUDE.js');
							expect(data).to.contain('./ignore/IGNORED.js');
							done();
						});
				});

				it('should pass on options to node-glob', function(done) {
					test(
						'./dummies/module.js',
						'var deps = require("./**/*.js", {mode: "hash", options: {ignore: \'*/ignore/**/*\'}});',
						function(data) {
							expect(data).to.contain('./include/INCLUDED.js');
							expect(data).to.contain('./include/nesting/NESTED_INCLUDE.js');
							expect(data).to.not.contain('./ignore/IGNORED.js');
							done();
						});
				});

				it('should remove itself if it doesn\'t match anything', function(done) {
					test(
						'./dummies/module.js',
						'var deps = require("./**/*.bogus", {mode: "hash"});',
						function(data) {
							expect(data).to.not.match(/require\(\s?("")|('')\)/);
							done();
						});
				});

				it('should not contain itself, even if it matches the glob', function(done) {
					test(
						'./dummies/include/module.js',
						'var deps = require("./*", {mode: "hash"});',
						function(data) {
							expect(data).to.not.contain('./module.js');
							expect(data).to.contain('./INCLUDED.js');
							done();
						});
				});

				it('should be able to match non-js files', function(done) {
					test(
						'./dummies/module.js',
						'var deps = require("./template/*", {mode: "hash"});',
						function(data) {
							expect(data).to.not.contain('./module.js');
							expect(data).to.contain('./template/TEMPLATED.hbs');
							done();
						});
				});

		});

		describe('with recursion starting from an ancestor directory', function() {

					it('should contain a file that matches the glob', function(done) {
						test(
							'./dummies/include/module.js',
							'var deps = require("../**/*.js", {mode: "hash"});',
							function(data) {
								expect(data).to.contain('../include/INCLUDED.js');
								expect(data).to.contain('../include/nesting/NESTED_INCLUDE.js');
								expect(data).to.contain('../ignore/IGNORED.js');
								expect(data).to.not.contain('../template/TEMPLATED.hbs');
								done();
							});
					});

					it('should pass on options to node-glob', function(done) {
						test(
							'./dummies/include/module.js',
							'var deps = require("../**/*.js", {mode: "hash", options: {ignore: \'*/ignore/**/*\'}});',
							function(data) {
								expect(data).to.contain('../include/INCLUDED.js');
								expect(data).to.contain('../include/nesting/NESTED_INCLUDE.js');
								expect(data).to.not.contain('../ignore/IGNORED.js');
								expect(data).to.not.contain('../template/TEMPLATED.hbs');
								done();
							});
					});

					it('should output null if it doesn\'t match anything', function(done) {
						test(
							'./dummies/include/module.js',
							'var deps = require("../**/*.bogus", {mode: "hash"});',
							function(data) {
								expect(data).to.not.match(/require\(\s?("")|('')\)/);
								expect(data).to.equal('var deps = null;');
								done();
							});
					});

					it('should not contain itself, even if it matches the glob', function(done) {
						test(
							'./dummies/include/nesting/module.js',
							'var deps = require("../*", {mode: "hash"});',
							function(data) {
								expect(data).to.not.contain('./module.js');
								expect(data).to.contain('../INCLUDED.js');
								done();
							});
					});

					it('should be able to match non-js files', function(done) {
						test(
							'./dummies/include/module.js',
							'var deps = require("../template/*", {mode: "hash"});',
							function(data) {
								expect(data).to.not.contain('./module.js');
								expect(data).to.contain('../template/TEMPLATED.hbs');
								done();
							});
					});

		});

		// should follow the 'ext' option when generating identifiers
		// should follow the 'path' option when generating identifiers

	});
});
