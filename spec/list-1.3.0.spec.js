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
    return content.match(REGEX_DEPS).slice(1).reduce(function(acc, cur, idx, lst) {
      var name = cur.substr(1, cur.length-2);
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

});
