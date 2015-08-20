var REGEX_FULL = /var deps = \[ *({ *name: *(?:(?:(?:'(?:(?:(?:\\(?=')')|[^'])*)')|(?:"(?:(?:(?:\\(?=")")|[^"])*)"))) *, *module: *require\((?:(?:(?:'(?:(?:(?:\\(?=')')|[^'])*)')|(?:"(?:(?:(?:\\(?=")")|[^"])*)")))\) *}(?: *, *{name: *(?:(?:(?:'(?:(?:(?:\\(?=')')|[^'])*)')|(?:"(?:(?:(?:\\(?=")")|[^"])*)"))) *, *module: *require\((?:(?:(?:'(?:(?:(?:\\(?=')')|[^'])*)')|(?:"(?:(?:(?:\\(?=")")|[^"])*)")))\) *})*)? *];/;
var REGEX_DEPS = /{ *name: *((?:'(?:(?:(?:\\(?=')')|[^'])*)')|(?:"(?:(?:(?:\\(?=")")|[^"])*)")) *, *module: *require\(((?:(?:'(?:(?:(?:\\(?=')')|[^'])*)')|(?:"(?:(?:(?:\\(?=")")|[^"])*)")))\) *}(?: *, *{ *name: *((?:'(?:(?:(?:\\(?=')')|[^'])*)')|(?:"(?:(?:(?:\\(?=")")|[^"])*)")) *, *module: *require\(((?:(?:'(?:(?:(?:\\(?=')')|[^'])*)')|(?:"(?:(?:(?:\\(?=")")|[^"])*)")))\) *})*/;

var util = require('./util');
var test = util.test;
var compare = util.compare;
var expect = util.expect;

var matches = function(data) {
  var content = data.match(REGEX_FULL)[1];
  if (typeof content === 'undefined') {
    return [];
  } else {
    var acc = [];
    acc.names = [];
    acc.paths = [];
    console.log(content);
    return content.match(REGEX_DEPS).slice(1).reduce(function(acc, cur, idx, lst) {
      var name = cur.substr(1, cur.length-2);
      console.log('Encountered match: ' + name);
      if (acc.length === 0 || typeof acc[acc.length-1].path === 'string') {
        acc.push({name: name});
        acc.names.push(name);
      } else {
        acc[acc.length-1].path = name;
        acc.paths.push(name);
      }
      return acc;
    }, acc);
  }
};

describe('mode:"list"', function() {

  describe('matching the right files', function() {

    describe('without recursion', function() {

      it('should contain a file that matches the glob', function(done) {
        test(
          './dummies/module.js',
          'var deps = require("./include/*", {mode: "list"});',
          function(data) {
            expect(data).to.match(REGEX_FULL);
            var includes = matches(data);
            expect(includes).to.have.length(2);
            expect(includes[0].name).to.equal('INCLUDED');
            expect(includes[0].path).to.equal('./include/INCLUDED.js');
            expect(includes[1].name).to.equal('INCLUDED2');
            expect(includes[1].path).to.equal('./include/INCLUDED2.js');
          }, done);
      });

      it('should return an empty array if it doesn\'t match anything', function(done) {
        test(
          './dummies/module.js',
          'var deps = require("./*", {mode: "list"});',
          function(data) {
            expect(data).to.match(REGEX_FULL);
            var includes = matches(data);
            expect(data).to.not.contain('./module.js');
            expect(data).to.contain('[]');
            expect(data).to.not.match(/require\(\s?("")|('')\)/);
          }, done);
      });

      it('should not contain itself, even if it matches the glob', function(done) {
        test(
          './dummies/include/module.js',
          'var deps = require("./*", {mode: "list"});',
          function(data) {
            expect(data).to.match(REGEX_FULL);
            var includes = matches(data);
            expect(data).to.not.contain('./module.js');
            expect(data).to.contain('./INCLUDED.js');
          }, done);
      });

      it('should be able to match non-js files', function(done) {
        test(
          './dummies/module.js',
          'var deps = require("./template/*", {mode: "list"});',
          function(data) {
            expect(data).to.match(REGEX_FULL);
            var includes = matches(data);
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
            'var deps = require("./**/*.js", {mode: "list"});',
            function(data) {
              expect(data).to.match(REGEX_FULL);
              var includes = matches(data);
              expect(data).to.contain('./include/INCLUDED.js');
              expect(data).to.contain('./include/nesting/NESTED_INCLUDE.js');
              expect(data).to.contain('./ignore/IGNORED.js');
            }, done);
        });

        it('should pass on options to node-glob', function(done) {
          test(
            './dummies/module.js',
            'var deps = require("./**/*.js", {mode: "list", options: {ignore: \'./ignore/**/*\'}});',
            function(data) {
              expect(data).to.match(REGEX_FULL);
              var includes = matches(data);
              expect(data).to.contain('./include/INCLUDED.js');
              expect(data).to.contain('./include/nesting/NESTED_INCLUDE.js');
              expect(data).to.not.contain('./ignore/IGNORED.js');
            }, done);
        });

        it('should return an empty array if it doesn\'t match anything', function(done) {
          test(
            './dummies/module.js',
            'var deps = require("./**/*.bogus", {mode: "list"});',
            function(data) {
              expect(data).to.match(REGEX_FULL);
              var includes = matches(data);
              expect(data).to.contain('[]');
              expect(data).to.not.match(/require\(\s?("")|('')\)/);
            }, done);
        });

        it('should not contain itself, even if it matches the glob', function(done) {
          test(
            './dummies/include/module.js',
            'var deps = require("./*", {mode: "list"});',
            function(data) {
              expect(data).to.match(REGEX_FULL);
              var includes = matches(data);
              expect(data).to.not.contain('./module.js');
              expect(data).to.contain('./INCLUDED.js');
            }, done);
        });

        it('should be able to match non-js files', function(done) {
          test(
            './dummies/module.js',
            'var deps = require("./template/*", {mode: "list"});',
            function(data) {
              expect(data).to.match(REGEX_FULL);
              var includes = matches(data);
              expect(data).to.not.contain('./module.js');
              expect(data).to.contain('./template/TEMPLATED.hbs');
            }, done);
        });

      });

      describe('starting from an ancestor directory', function() {

        it('should contain a file that matches the glob', function(done) {
          test(
            './dummies/include/module.js',
            'var deps = require("../**/*.js", {mode: "list"});',
            function(data) {
              expect(data).to.match(REGEX_FULL);
              var includes = matches(data);
              expect(data).to.contain('../include/INCLUDED.js');
              expect(data).to.contain('../include/nesting/NESTED_INCLUDE.js');
              expect(data).to.contain('../ignore/IGNORED.js');
              expect(data).to.not.contain('../template/TEMPLATED.hbs');
            }, done);
        });

        it('should pass on options to node-glob', function(done) {
          test(
            './dummies/include/module.js',
            'var deps = require("../**/*.js", {mode: "list", options: {ignore: \'../ignore/**/*\'}});',
            function(data) {
              expect(data).to.match(REGEX_FULL);
              var includes = matches(data);
              expect(data).to.contain('../include/INCLUDED.js');
              expect(data).to.contain('../include/nesting/NESTED_INCLUDE.js');
              expect(data).to.not.contain('../ignore/IGNORED.js');
              expect(data).to.not.contain('../template/TEMPLATED.hbs');
            }, done);
        });

        it('should return an empty array if it doesn\'t match anything', function(done) {
          test(
            './dummies/include/module.js',
            'var deps = require("../**/*.bogus", {mode: "list"});',
            function(data) {
              expect(data).to.match(REGEX_FULL);
              var includes = matches(data);
              expect(data).to.not.match(/require\(\s?("")|('')\)/);
              expect(data).to.equal('var deps = [];');
            }, done);
        });

        it('should not contain itself, even if it matches the glob', function(done) {
          test(
            './dummies/include/nesting/module.js',
            'var deps = require("../*", {mode: "list"});',
            function(data) {
              expect(data).to.match(REGEX_FULL);
              var includes = matches(data);
              expect(data).to.not.contain('./module.js');
              expect(data).to.contain('../INCLUDED.js');
            }, done);
        });

        it('should be able to match non-js files', function(done) {
          test(
            './dummies/include/module.js',
            'var deps = require("../template/*", {mode: "list"});',
            function(data) {
              expect(data).to.match(REGEX_FULL);
              var includes = matches(data);
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
          'require("./include/**", {mode: "list"});',
          'require("./include/**", {mode: "list", resolve:["path-reduce", "strip-ext"]});',
          done);
      });

    });

    describe('resolve:"path-reduce"', function() {

      it('should remove common path', function(done) {
        test(
          './dummies/module.js',
          'var deps = require("./include/**/*", {mode: "list", resolve: "path-reduce"});',
          function(data) {
            expect(data).to.match(REGEX_FULL);
            var includes = matches(data);
            console.log(includes);
            expect(includes).to.have.length(3);
            expect(includes[0].name).to.equal('INCLUDED.js');
            expect(includes[0].path).to.equal('include/INCLUDED.js');
            expect(includes[1].name).to.equal('INCLUDED2.js');
            expect(includes[1].path).to.equal('include/INCLUDED2.js');
            expect(includes[2].name).to.equal('nesting/NESTED_INCLUDE.js');
            expect(includes[2].path).to.equal('include/nesting/NESTED_INCLUDE.js');
          }, done);
      });

    });

    describe('resolve:"path"', function() {

      it('should use relative path as key', function(done) {
        test(
          './dummies/module.js',
          'var deps = require("./include/**/*", {mode: "list", resolve: "path", ext:true});',
          function(data) {
            expect(data).to.match(REGEX_FULL);
            console.log(data);
            var includes = matches(data);
            expect(includes).to.have.length(3);
            expect(includes[0].name).to.equal('./include/INCLUDED.js');
            expect(includes[0].path).to.equal('./include/INCLUDED.js');
            expect(includes[1].name).to.equal('./include/INCLUDED2.js');
            expect(includes[1].path).to.equal('./include/INCLUDED2.js');
            expect(includes[2].name).to.equal('./include/nesting/NESTED_INCLUDE.js');
            expect(includes[2].path).to.equal('./include/nesting/NESTED_INCLUDE.js');
          }, done);
      });

      it('should use relative path as key, even when referring to a sibling', function(done) {
        test(
          './dummies/ignore/module.js',
          'var deps = require("../**/*", {mode: "list", resolve: "path", ext:true});',
          function(data) {
            expect(data).to.match(REGEX_FULL);
            var includes = matches(data);
            expect(includes).to.have.length(3);
            expect(includes[0].name).to.equal('../include/INCLUDED.js');
            expect(includes[0].path).to.equal('../include/INCLUDED.js');
            expect(includes[1].name).to.equal('../include/INCLUDED2.js');
            expect(includes[1].path).to.equal('../include/INCLUDED2.js');
            expect(includes[2].name).to.equal('../include/nesting/NESTED_INCLUDE.js');
            expect(includes[2].path).to.equal('../include/nesting/NESTED_INCLUDE.js');
          }, done);
      });

    });

    describe('resolve:"reduce-postfix"', function() {

      it('should remove common postfix', function(done) {
        test(
          './dummies/module.js',
          'var deps = require("./include/**/*", {mode: "list", resolve: "reduce-postfix", ext:true});',
          function(data) {
            expect(data).to.match(REGEX_FULL);
            var includes = matches(data);
            expect(includes).to.have.length(3);
            expect(includes[0].name).to.equal('./include/INCLUDED');
            expect(includes[0].path).to.equal('./include/INCLUDED.js');
            expect(includes[1].name).to.equal('./include/INCLUDED2');
            expect(includes[1].path).to.equal('./include/INCLUDED2.js');
            expect(includes[2].name).to.equal('./include/nesting/NESTED_INCLUDE');
            expect(includes[2].path).to.equal('./include/nesting/NESTED_INCLUDE.js');
          }, done);
      });

    });

    describe('resolve:"reduce-prefix"', function() {

      it('should remove common prefix', function(done) {
        test(
          './dummies/module.js',
          'var deps = require("./include/*", {mode: "list", resolve: "reduce-prefix", ext:true});',
          function(data) {
            expect(data).to.match(REGEX_FULL);
            var includes = matches(data);
            expect(includes).to.have.length(2);
            expect(includes[0].name).to.equal('.js');
            expect(includes[0].path).to.equal('./include/INCLUDED.js');
            expect(includes[1].name).to.equal('2.js');
            expect(includes[1].path).to.equal('./include/INCLUDED2.js');
          }, done);
      });

    });

    describe('resolve:"reduce"', function() {

      it('should remove common pre- and postfix', function(done) {
        test(
          './dummies/module.js',
          'var deps = require("./include/*", {mode: "list", resolve: "reduce", ext:true});',
          function(data) {
            expect(data).to.match(REGEX_FULL);
            var includes = matches(data);
            expect(includes).to.have.length(2);
            expect(includes[0].name).to.equal('');
            expect(includes[0].path).to.equal('./include/INCLUDED.js');
            expect(includes[1].name).to.equal('2');
            expect(includes[1].path).to.equal('./include/INCLUDED2.js');
          }, done);
      });

    });

    describe('resolve:"strip-ext"', function() {

      it('should remove extension', function(done) {
        test(
          './dummies/module.js',
          'var deps = require("./include/*", {mode: "list", resolve: "strip-ext"});',
          function(data) {
            expect(data).to.match(REGEX_FULL);
            var includes = matches(data);
            expect(includes).to.have.length(2);
            expect(includes[0].name).to.equal('./include/INCLUDED');
            expect(includes[0].path).to.equal('./include/INCLUDED.js');
            expect(includes[1].name).to.equal('./include/INCLUDED2');
            expect(includes[1].path).to.equal('./include/INCLUDED2.js');
          }, done);
      });

      it('should not remove extension if it causes naming collisions', function(done) {
        test(
          './dummies/template/module.js',
          'var deps = require("./*", {mode: "list", resolve: "strip-ext"});',
          function(data) {
            expect(data).to.match(REGEX_FULL);
            var includes = matches(data);
            expect(includes).to.have.length(2);
            expect(includes[0].name).to.equal('./TEMPLATED.hbs');
            expect(includes[0].path).to.equal('./TEMPLATED.hbs');
            expect(includes[1].name).to.equal('./TEMPLATED.js');
            expect(includes[1].path).to.equal('./TEMPLATED.js');
          }, done);
      });

    });

  });

});
