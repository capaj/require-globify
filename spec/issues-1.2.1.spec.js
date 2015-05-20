var util = require('./util');
var test = util.test;
var compare = util.compare;
var expect = util.expect;

describe('issues/12', function() {

  it('should output a reduced path with extensions stripped when resolver: ["path-reduce", "strip-ext"] is used', function(done) {
    test(
      './dummies/include/module.js',
      'var deps = require("./*", {mode: "hash", resolve: [ "strip-ext", "path-reduce" ]});',
      function(data) {
        expect(data).to.equal("var deps = {'INCLUDED': require('./INCLUDED.js'),'INCLUDED2': require('./INCLUDED2.js')};");
      }, done);
  });

  it('should output a reduced path with extensions stripped when resolver: ["strip-ext", "path-reduce"] is used', function(done) {
    test(
      './dummies/include/module.js',
      'var deps = require("./*", {mode: "hash", resolve: [ "path-reduce", "strip-ext" ]});',
      function(data) {
        expect(data).to.equal("var deps = {'INCLUDED': require('./INCLUDED.js'),'INCLUDED2': require('./INCLUDED2.js')};");
      }, done);
  });

  it('should return the same whether path-reduce or strip-ext comes first', function(done) {
    compare('./dummies/module.js',
      'require("./include/**/*", {mode: "hash", resolve: [ "strip-ext", "path-reduce" ]});',
      'require("./include/**/*", {mode: "hash", resolve: [ "path-reduce", "strip-ext" ]});',
      done);
  });

});

describe('issues/13', function() {
  // // Input
  // var templates = require('./templates/*.hbs', { mode: 'hash' });
  //
  // // Output
  // var templates =  {
  //     './templates/zoning': require('./templates/zoning.hbs')
  // };
  //
  // // Output expected
  // var templates =  {
  //     'zoning.hbs': require('./templates/zoning.hbs')
  // };
  it('should output a single file with relative directory without extension', function(done) {
    test(
      './dummies/include/module.js',
      'var deps = require("./nesting/*.js", {mode: "hash"});', //default resolve: ["path-reduce", "strip-ext"]
      function(data) {
        expect(data).to.equal("var deps = {'NESTED_INCLUDE': require('./nesting/NESTED_INCLUDE.js')};");
      }, done);
  });

  it('should output a single file with relative directory with extension if only path-reduce is specified', function(done) {
    test(
      './dummies/include/module.js',
      'var deps = require("./nesting/*.js", {mode: "hash", resolve:["path-reduce"]});', //default resolve: ["path-reduce", "strip-ext"]
      function(data) {
        expect(data).to.equal("var deps = {'NESTED_INCLUDE.js': require('./nesting/NESTED_INCLUDE.js')};");
      }, done);
  });
});

describe('issues/14', function() {
  it('should allow the use of a custom mode', function(done) {
    test(
      './dummies/include/module.js',
      'var deps = require("./nesting/*.js", {mode: function(base, files, config) {return "require(\'nothing\')"}});', //default resolve: ["path-reduce", "strip-ext"]
      function(data) {
        expect(data).to.equal("var deps = require(\'nothing\');");
      }, done);
  });
});
