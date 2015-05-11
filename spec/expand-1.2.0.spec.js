var util = require('./util');
var test = util.test;
var compare = util.compare;
var expect = util.expect;

describe('mode:"expand"', function() {

  describe('without recursion', function() {

    it('should contain a file that matches the glob', function(done) {
      test(
        './dummies/module.js',
        'require("./include/*", {mode: "expand"});',
        function(data) {
          expect(data).to.contain('./include/INCLUDED.js');
          expect(data).to.contain('./include/INCLUDED2.js');
          expect(data).to.not.contain('./include/nesting/NESTED_INCLUDE.js');
        }, done);
    });

    it('should pass on options to node-glob', function(done) {
      test(
        './dummies/module.js',
        'require("./include/*.js", {mode: "expand", options: {ignore: \'./include/*2.*\'}});',
        function(data) {
          expect(data).to.contain('./include/INCLUDED.js');
          expect(data).to.not.contain('./include/INCLUDED2.js');
        }, done);
    });

    it('should remove itself if it doesn\'t match anything', function(done) {
      test(
        './dummies/module.js',
        'require("./*", {mode: "expand"});',
        function(data) {
          expect(data).to.not.contain('./module.js');
          expect(data).to.not.match(/require\(\s?("")|('')\)/);
        }, done);
    });

    it('should not contain itself, even if it matches the glob', function(done) {
      test(
        './dummies/include/module.js',
        'require("./*", {mode: "expand"});',
        function(data) {
          expect(data).to.not.contain('./module.js');
          expect(data).to.contain('./INCLUDED.js');
        }, done);
    });

    it('should be able to match non-js files', function(done) {
      test(
        './dummies/module.js',
        'require("./template/*", {mode: "expand"});',
        function(data) {
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
          'require("./**/*.js", {mode: "expand"});',
          function(data) {
            expect(data).to.contain('./include/INCLUDED.js');
            expect(data).to.contain('./include/nesting/NESTED_INCLUDE.js');
            expect(data).to.contain('./ignore/IGNORED.js');
          }, done);
      });

      it('should pass on options to node-glob', function(done) {
        test(
          './dummies/module.js',
          'require("./**/*.js", {mode: "expand", options: {ignore: \'./ignore/**/*\'}});',
          function(data) {
            expect(data).to.contain('./include/INCLUDED.js');
            expect(data).to.contain('./include/nesting/NESTED_INCLUDE.js');
            expect(data).to.not.contain('./ignore/IGNORED.js');
          }, done);
      });

      it('should remove itself if it doesn\'t match anything', function(done) {
        test(
          './dummies/module.js',
          'require("./**/*.bogus", {mode: "expand"});',
          function(data) {
            expect(data).to.not.match(/require\(\s?("")|('')\)/);
          }, done);
      });

      it('should not contain itself, even if it matches the glob', function(done) {
        test(
          './dummies/include/module.js',
          'require("./*", {mode: "expand"});',
          function(data) {
            expect(data).to.not.contain('./module.js');
            expect(data).to.contain('./INCLUDED.js');
          }, done);
      });

      it('should be able to match non-js files', function(done) {
        test(
          './dummies/module.js',
          'require("./template/*", {mode: "expand"});',
          function(data) {
            expect(data).to.not.contain('./module.js');
            expect(data).to.contain('./template/TEMPLATED.hbs');
          }, done);
      });

    });

    describe('starting from an ancestor directory', function() {

      it('should contain a file that matches the glob', function(done) {
        test(
          './dummies/include/module.js',
          'require("../**/*.js", {mode: "expand"});',
          function(data) {
            expect(data).to.contain('../include/INCLUDED.js');
            expect(data).to.contain('../include/nesting/NESTED_INCLUDE.js');
            expect(data).to.contain('../ignore/IGNORED.js');
            expect(data).to.not.contain('../template/TEMPLATED.hbs');
          }, done);
      });

      it('should pass on options to node-glob', function(done) {
        test(
          './dummies/include/module.js',
          'require("../**/*.js", {mode: "expand", options: {ignore: \'../ignore/**/*\'}});',
          function(data) {
            expect(data).to.contain('../include/INCLUDED.js');
            expect(data).to.contain('../include/nesting/NESTED_INCLUDE.js');
            expect(data).to.not.contain('../ignore/IGNORED.js');
            expect(data).to.not.contain('../template/TEMPLATED.hbs');
          }, done);
      });

      it('should remove itself if it doesn\'t match anything', function(done) {
        test(
          './dummies/include/module.js',
          'require("../**/*.bogus", {mode: "expand"});',
          function(data) {
            expect(data).to.not.match(/require\(\s?("")|('')\)/);
          }, done);
      });

      it('should not contain itself, even if it matches the glob', function(done) {
        test(
          './dummies/include/nesting/module.js',
          'require("../*", {mode: "expand"});',
          function(data) {
            expect(data).to.not.contain('./module.js');
            expect(data).to.contain('../INCLUDED.js');
          }, done);
      });

      it('should be able to match non-js files', function(done) {
        test(
          './dummies/include/module.js',
          'require("../template/*", {mode: "expand"});',
          function(data) {
            expect(data).to.not.contain('./module.js');
            expect(data).to.contain('../template/TEMPLATED.hbs');
          }, done);
      });

    });

  });

});

describe('glob:true (should behave exactly like mode: "expand")', function() {

  describe('without recursion', function() {

    it('should contain a file that matches the glob', function(done) {
      compare('./dummies/module.js',
        'require("./include/*", {mode: "expand"});',
        'require("./include/*", {glob: true});',
        done);
    });

    it('should pass on options to node-glob', function(done) {
      compare('./dummies/module.js',
        'require("./include/*.js", {mode: "expand", options: {ignore: \'./include/*2.*\'}});',
        'require("./include/*.js", {glob: true, options: {ignore: \'./include/*2.*\'}});',
        done);
    });

    it('should remove itself if it doesn\'t match anything', function(done) {
      compare('./dummies/module.js',
        'require("./*", {mode: "expand"});',
        'require("./*", {glob: true});',
        done);
    });

    it('should not contain itself, even if it matches the glob', function(done) {
      compare('./dummies/include/module.js',
        'require("./*", {mode: "expand"});',
        'require("./*", {glob: true});',
        done);
    });

    it('should be able to match non-js files', function(done) {
      compare('./dummies/module.js',
        'require("./template/*", {mode: "expand"});',
        'require("./template/*", {glob: true});',
        done);
    });

  });

  describe('with recursion', function() {

    describe('starting from current directory', function() {

      it('should contain a file that matches the glob', function(done) {
        compare('./dummies/module.js',
          'require("./**/*.js", {mode: "expand"});',
          'require("./**/*.js", {glob: true});',
          done);
      });

      it('should pass on options to node-glob', function(done) {
        compare('./dummies/module.js',
          'require("./**/*.js", {mode: "expand", options: {ignore: \'./ignore/**/*\'}});',
          'require("./**/*.js", {glob: true, options: {ignore: \'./ignore/**/*\'}});',
          done);
      });

      it('should remove itself if it doesn\'t match anything', function(done) {
        compare('./dummies/module.js',
          'require("./**/*.bogus", {mode: "expand"});',
          'require("./**/*.bogus", {glob: true});',
          done);
      });

      it('should not contain itself, even if it matches the glob', function(done) {
        compare('./dummies/include/module.js',
          'require("./*", {mode: "expand"});',
          'require("./*", {glob: true});',
          done);
      });

      it('should be able to match non-js files', function(done) {
        compare('./dummies/module.js',
          'require("./template/*", {mode: "expand"});',
          'require("./template/*", {glob: true});',
          done);
      });

    });

    describe('with recursion starting from an ancestor directory', function() {

      it('should contain a file that matches the glob', function(done) {
        compare('./dummies/include/module.js',
          'require("../**/*.js", {mode: "expand"});',
          'require("../**/*.js", {glob: true});',
          done);
      });

      it('should pass on options to node-glob', function(done) {
        compare('./dummies/include/module.js',
          'require("../**/*.js", {mode: "expand", options: {ignore: \'../ignore/**/*\'}});',
          'require("../**/*.js", {glob: true, options: {ignore: \'../ignore/**/*\'}});',
          done);
      });

      it('should remove itself if it doesn\'t match anything', function(done) {
        compare('./dummies/include/module.js',
          'require("../**/*.bogus", {mode: "expand"});',
          'require("../**/*.bogus", {glob: true});',
          done);
      });

      it('should not contain itself, even if it matches the glob', function(done) {
        compare('./dummies/include/nesting/module.js',
          'require("../*", {mode: "expand"});',
          'require("../*", {glob: true});',
          done);
      });

      it('should be able to match non-js files', function(done) {
        compare('./dummies/include/module.js',
          'require("../template/*", {mode: "expand"});',
          'require("../template/*", {glob: true});',
          done);
      });

    });

  });

});
