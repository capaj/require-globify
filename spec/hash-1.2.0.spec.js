var REGEX_FULL = /var deps = { *((?:(?:'(?:(?:(?:\\(?=')')|[^'])*)')|(?:"(?:(?:(?:\\(?=")")|[^"])*)")) *: *require\((?:(?:(?:'(?:(?:(?:\\(?=')')|[^'])*)')|(?:"(?:(?:(?:\\(?=")")|[^"])*)")))\)(?: *, *(?:(?:'(?:(?:(?:\\(?=')')|[^'])*)')|(?:"(?:(?:(?:\\(?=")")|[^"])*)")) *: *require\((?:(?:(?:'(?:(?:(?:\\(?=')')|[^'])*)')|(?:"(?:(?:(?:\\(?=")")|[^"])*)")))\))*)? *};/;
var REGEX_DEPS = /((?:'(?:(?:(?:\\(?=')')|[^'])*)')|(?:"(?:(?:(?:\\(?=")")|[^"])*)")) *: *require\(((?:(?:'(?:(?:(?:\\(?=')')|[^'])*)')|(?:"(?:(?:(?:\\(?=")")|[^"])*)")))\)(?: *, *((?:'(?:(?:(?:\\(?=')')|[^'])*)')|(?:"(?:(?:(?:\\(?=")")|[^"])*)")) *: *require\(((?:(?:'(?:(?:(?:\\(?=')')|[^'])*)')|(?:"(?:(?:(?:\\(?=")")|[^"])*)")))\))*/;

var util = require('./util');
var test = util.test;
var compare = util.compare;
var expect = util.expect;
var matches = util.matchFn(REGEX_FULL, REGEX_DEPS);


describe('mode:"hash"', function() {

  describe('matching the right files', function() {

    describe('without recursion', function() {

      it('should contain a file that matches the glob', function(done) {
        test(
          './dummies/module.js',
          'var deps = require("./include/*", {mode: "hash"});',
          function(data) {
            expect(data).to.match(REGEX_FULL);
            var includes = matches(data);
            console.log(includes);
            expect(includes).to.have.length(2);
            expect(data).to.contain('./include/INCLUDED.js');
            expect(data).to.not.contain('./include/nesting/NESTED_INCLUDE.js');
          }, done);
      });

      it('should return an empty object if it doesn\'t match anything', function(done) {
        test(
          './dummies/module.js',
          'var deps = require("./*", {mode: "hash"});',
          function(data) {
            expect(data).to.match(REGEX_FULL);
            expect(data).to.not.contain('./module.js');
            expect(data).to.contain('{}');
            expect(data).to.not.match(/require\(\s?("")|('')\)/);
          }, done);
      });

      it('should not contain itself, even if it matches the glob', function(done) {
        test(
          './dummies/include/module.js',
          'var deps = require("./*", {mode: "hash"});',
          function(data) {
            expect(data).to.match(REGEX_FULL);
            expect(data).to.not.contain('./module.js');
            expect(data).to.contain('./INCLUDED.js');
          }, done);
      });

      it('should be able to match non-js files', function(done) {
        test(
          './dummies/module.js',
          'var deps = require("./template/*", {mode: "hash"});',
          function(data) {
            expect(data).to.match(REGEX_FULL);
            expect(data).to.not.contain('./module.js');
            expect(data).to.contain('./template/TEMPLATED.hbs');
          }, done);
      });

    });

    describe('with recursion', function() {

      describe('starting from current directory', function() {

        it('should contain a file that matches the glob', function(done) {
          test(
            './dummies/module.js',
            'var deps = require("./**/*.js", {mode: "hash"});',
            function(data) {
              expect(data).to.match(REGEX_FULL);
              expect(data).to.contain('./include/INCLUDED.js');
              expect(data).to.contain('./include/nesting/NESTED_INCLUDE.js');
              expect(data).to.contain('./ignore/IGNORED.js');
            }, done);
        });

        it('should pass on options to node-glob', function(done) {
          test(
            './dummies/module.js',
            'var deps = require("./**/*.js", {mode: "hash", options: {ignore: \'./ignore/**/*\'}});',
            function(data) {
              expect(data).to.match(REGEX_FULL);
              expect(data).to.contain('./include/INCLUDED.js');
              expect(data).to.contain('./include/nesting/NESTED_INCLUDE.js');
              expect(data).to.not.contain('./ignore/IGNORED.js');
            }, done);
        });

        it('should return an empty object if it doesn\'t match anything', function(done) {
          test(
            './dummies/module.js',
            'var deps = require("./**/*.bogus", {mode: "hash"});',
            function(data) {
              expect(data).to.contain('{}');
              expect(data).to.not.match(/require\(\s?("")|('')\)/);
            }, done);
        });

        it('should not contain itself, even if it matches the glob', function(done) {
          test(
            './dummies/include/module.js',
            'var deps = require("./*", {mode: "hash"});',
            function(data) {
              expect(data).to.match(REGEX_FULL);
              expect(data).to.not.contain('./module.js');
              expect(data).to.contain('./INCLUDED.js');
            }, done);
        });

        it('should be able to match non-js files', function(done) {
          test(
            './dummies/module.js',
            'var deps = require("./template/*", {mode: "hash"});',
            function(data) {
              expect(data).to.match(REGEX_FULL);
              expect(data).to.not.contain('./module.js');
              expect(data).to.contain('./template/TEMPLATED.hbs');
            }, done);
        });

      });

      describe('starting from an ancestor directory', function() {

        it('should contain a file that matches the glob', function(done) {
          test(
            './dummies/include/module.js',
            'var deps = require("../**/*.js", {mode: "hash"});',
            function(data) {
              expect(data).to.match(REGEX_FULL);
              expect(data).to.contain('../include/INCLUDED.js');
              expect(data).to.contain('../include/nesting/NESTED_INCLUDE.js');
              expect(data).to.contain('../ignore/IGNORED.js');
              expect(data).to.not.contain('../template/TEMPLATED.hbs');
            }, done);
        });

        it('should pass on options to node-glob', function(done) {
          test(
            './dummies/include/module.js',
            'var deps = require("../**/*.js", {mode: "hash", options: {ignore: \'../ignore/**/*\'}});',
            function(data) {
              expect(data).to.match(REGEX_FULL);
              expect(data).to.contain('../include/INCLUDED.js');
              expect(data).to.contain('../include/nesting/NESTED_INCLUDE.js');
              expect(data).to.not.contain('../ignore/IGNORED.js');
              expect(data).to.not.contain('../template/TEMPLATED.hbs');
            }, done);
        });

        it('should return an empty object if it doesn\'t match anything', function(done) {
          test(
            './dummies/include/module.js',
            'var deps = require("../**/*.bogus", {mode: "hash"});',
            function(data) {
              expect(data).to.match(REGEX_FULL);
              expect(data).to.not.match(/require\(\s?("")|('')\)/);
              expect(data).to.equal('var deps = {};');
            }, done);
        });

        it('should not contain itself, even if it matches the glob', function(done) {
          test(
            './dummies/include/nesting/module.js',
            'var deps = require("../*", {mode: "hash"});',
            function(data) {
              expect(data).to.match(REGEX_FULL);
              expect(data).to.not.contain('./module.js');
              expect(data).to.contain('../INCLUDED.js');
            }, done);
        });

        it('should be able to match non-js files', function(done) {
          test(
            './dummies/include/module.js',
            'var deps = require("../template/*", {mode: "hash"});',
            function(data) {
              expect(data).to.match(REGEX_FULL);
              expect(data).to.not.contain('./module.js');
              expect(data).to.contain('../template/TEMPLATED.hbs');
            }, done);
        });

      });

    });

  });

  describe('with resolver option', function() {

    // - path
    // - strip-ext
    // - path-reduce
    // - reduce-prefix
    // - reduce-postfix
    // - reduce

    describe('default', function() {

      it('should use ["path-reduce", "strip-ext"] as default', function(done) {
        compare('./dummies/module.js',
          'require("./include/**", {mode: "hash"});',
          'require("./include/**", {mode: "hash", resolve:["path-reduce", "strip-ext"]});',
          done);
      });

    });

    describe('resolve:"path-reduce"', function() {

      it('should remove common path', function(done) {
        test(
          './dummies/module.js',
          'var deps = require("./include/**/*", {mode: "hash", resolve: "path-reduce"});',
          function(data) {
            expect(data).to.match(REGEX_FULL);
            expect(data).to.contain("'INCLUDED.js': require(");
            expect(data).to.contain("'INCLUDED2.js': require(");
            expect(data).to.contain("'nesting/NESTED_INCLUDE.js': require(");
          }, done);
      });

    });

    describe('resolve:"path"', function() {

      it('should use relative path as key', function(done) {
        test(
          './dummies/module.js',
          'var deps = require("./include/**/*", {mode: "hash", resolve: "path", ext:true});',
          function(data) {
            expect(data).to.match(REGEX_FULL);
            expect(data).to.contain("'include/INCLUDED.js': require(");
            expect(data).to.contain("'include/INCLUDED2.js': require(");
            expect(data).to.contain("'include/nesting/NESTED_INCLUDE.js': require(");
          }, done);
      });

      it('should use relative path as key, when referring to a sibling', function(done) {
        test(
          './dummies/ignore/module.js',
          'var deps = require("../**/*", {mode: "hash", resolve: "path", ext:true});',
          function(data) {
            expect(data).to.match(REGEX_FULL);
            expect(data).to.contain("'../include/INCLUDED.js': require(");
            expect(data).to.contain("'../include/INCLUDED2.js': require(");
            expect(data).to.contain("'../include/nesting/NESTED_INCLUDE.js': require(");
          }, done);
      });

    });

    describe('resolve:"reduce-postfix"', function() {

      it('should remove common postfix', function(done) {
        test(
          './dummies/module.js',
          'var deps = require("./include/**/*", {mode: "hash", resolve: "reduce-postfix", ext:true});',
          function(data) {
            expect(data).to.match(REGEX_FULL);
            expect(data).to.contain("'./include/INCLUDED': require(");
            expect(data).to.contain("'./include/INCLUDED2': require(");
            expect(data).to.contain("'./include/nesting/NESTED_INCLUDE': require(");
          }, done);
      });

    });

    describe('resolve:"reduce-prefix"', function() {

      it('should remove common prefix', function(done) {
        test(
          './dummies/module.js',
          'var deps = require("./include/*", {mode: "hash", resolve: "reduce-prefix", ext:true});',
          function(data) {
            expect(data).to.match(REGEX_FULL);
            expect(data).to.contain("'.js': require(");
            expect(data).to.contain("'2.js': require(");
          }, done);
      });

    });

    describe('resolve:"reduce"', function() {

      it('should remove common pre- and postfix', function(done) {
        test(
          './dummies/module.js',
          'var deps = require("./include/*", {mode: "hash", resolve: "reduce", ext:true});',
          function(data) {
            expect(data).to.match(REGEX_FULL);
            expect(data).to.contain("'': require(");
            expect(data).to.contain("'2': require(");
          }, done);
      });

    });

    describe('resolve:"strip-ext"', function() {

      it('should remove extension', function(done) {
        test(
          './dummies/module.js',
          'var deps = require("./include/*", {mode: "hash", resolve: "strip-ext"});',
          function(data) {
            expect(data).to.match(REGEX_FULL);
            expect(data).to.contain("'./include/INCLUDED': require(");
            expect(data).to.contain("'./include/INCLUDED2': require(");
          }, done);
      });

      it('should not remove extension if it causes naming collisions', function(done) {
        test(
          './dummies/template/module.js',
          'var deps = require("./*", {mode: "hash", resolve: "strip-ext"});',
          function(data) {
            expect(data).to.match(REGEX_FULL);
            expect(data).to.contain("'./TEMPLATED.hbs': require(");
            expect(data).to.contain("'./TEMPLATED.js': require(");
          }, done);
      });

    });

  });

});

describe('backwards compatibility', function() {

  describe('hash:true', function() { // default ext:false

    describe('[default]', function() {
      it('should equal {mode:"hash"}', function(done) {
        compare('./dummies/module.js',
          'require("./include/**/*", {hash: true});',
          'require("./include/**/*", {mode: "hash"});',
          done);
      });

    });

    describe(', ext:false', function() {

      it('should equal {mode:"hash"}', function(done) {
        compare('./dummies/module.js',
          'require("./include/**/*", {hash: true, ext: false});',
          'require("./include/**/*", {mode: "hash"});',
          done);
      });

    });

    describe(', ext:true', function() {

      it('should equal {mode:"hash", resolve:"path-reduce"}', function(done) {
        compare('./dummies/module.js',
          'require("./include/**/*", {hash: true, ext: true});',
          'require("./include/**/*", {mode: "hash", resolve:"path-reduce"});',
          done);
      });

    });

  });

  describe('hash:"path"', function() { // default ext:false

    describe('[default]', function() {
      it('should equal {mode:"hash", resolve:["path", "strip-ext"]}', function(done) {
        compare('./dummies/module.js',
          'require("./include/**/*", {hash: "path"});',
          'require("./include/**/*", {mode: "hash", resolve:["path", "strip-ext"]});',
          done);
      });

    });

    describe(', ext:false', function() {

      it('should equal {mode:"hash", resolve:["path", "strip-ext"]}', function(done) {
        compare('./dummies/module.js',
          'require("./include/**/*", {hash: "path", ext: false});',
          'require("./include/**/*", {mode: "hash", resolve:["path", "strip-ext"]});',
          done);
      });

    });

    describe(', ext:true', function() {

      it('should equal {mode:"hash", resolve:"path"}', function(done) {
        compare('./dummies/module.js',
          'require("./include/**/*", {hash: "path", ext: true});',
          'require("./include/**/*", {mode: "hash", resolve:"path"});',
          done);
      });

    });

  });

});
