var transform = require('..');
var expect = require('chai').expect;
var path = require('path');
var runTransform = require('browserify-transform-tools').runTransform;

var test = function test(location, content, checkData, done) {
  runTransform(
    transform,
    path.resolve(__dirname, location),
    { content: content },
    function(err, data) {
      if (err) {
        done(err);
      } else {
        try {
          checkData(data);
          done();
        } catch (ex) {
          done(ex);
        }
      }
    });
};

var compare = function compare(location, one, other, done) {
  var oneResult, otherResult;
  var finish = function() {
    if (typeof otherResult === 'undefined' || typeof oneResult === 'undefined') {
      return;
    }
    expect(otherResult).to.equal(oneResult);
    done();
  };
  test(location, one, function(data) {
    oneResult = data;
  }, finish);
  test(location, other, function(data) {
    otherResult = data;
  }, finish);
};

module.exports = {
  expect: expect,
  test: test,
  compare: compare
};
