var util = require('./util');
var test = util.test;
var compare = util.compare;
var expect = util.expect;

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
      }, done);
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
      }, done);
  });

});
