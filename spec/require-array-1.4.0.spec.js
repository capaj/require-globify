var REGEX_FULL = /var deps = { *((?:(?:'(?:(?:(?:\\(?=')')|[^'])*)')|(?:"(?:(?:(?:\\(?=")")|[^"])*)")) *: *require\((?:(?:(?:'(?:(?:(?:\\(?=')')|[^'])*)')|(?:"(?:(?:(?:\\(?=")")|[^"])*)")))\)(?: *, *(?:(?:'(?:(?:(?:\\(?=')')|[^'])*)')|(?:"(?:(?:(?:\\(?=")")|[^"])*)")) *: *require\((?:(?:(?:'(?:(?:(?:\\(?=')')|[^'])*)')|(?:"(?:(?:(?:\\(?=")")|[^"])*)")))\))*)? *};/;
var REGEX_DEPS = /((?:'(?:(?:(?:\\(?=')')|[^'])*)')|(?:"(?:(?:(?:\\(?=")")|[^"])*)")) *: *require\(((?:(?:'(?:(?:(?:\\(?=')')|[^'])*)')|(?:"(?:(?:(?:\\(?=")")|[^"])*)")))\)(?: *, *((?:'(?:(?:(?:\\(?=')')|[^'])*)')|(?:"(?:(?:(?:\\(?=")")|[^"])*)")) *: *require\(((?:(?:'(?:(?:(?:\\(?=')')|[^'])*)')|(?:"(?:(?:(?:\\(?=")")|[^"])*)")))\))*/;

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


describe('issues/18', function() {

  it('should include matches from multiple patterns', function(done) {
    test(
      './dummies/module.js',
      'var deps = require(["./include/*", "./template/*"], {mode: "hash"});',
      function(data) {
        expect(data).to.match(REGEX_FULL);
        var includes = matches(data);
        expect(includes).to.have.length(4);
        expect(includes[0].name).to.equal('INCLUDED');
        expect(includes[0].path).to.equal('./include/INCLUDED.js');
        expect(includes[1].name).to.equal('INCLUDED2');
        expect(includes[1].path).to.equal('./include/INCLUDED2.js');
        expect(includes[2].name).to.equal('TEMPLATED.hbs');
        expect(includes[2].path).to.equal('./template/TEMPLATED.hbs');
        expect(includes[3].name).to.equal('TEMPLATED.js');
        expect(includes[3].path).to.equal('./template/TEMPLATED.js');
      }, done);
  });

});
