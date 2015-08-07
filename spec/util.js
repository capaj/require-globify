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

var matchFn = function matchFn(full_regex, deps_regex) {
  return function(data) {
    return data.match(full_regex)[1].match(deps_regex).slice(1).reduce(function(acc, cur, idx, lst) {
      if (acc.length === 0 || typeof acc[acc.length-1].path === 'string') {
        acc.push({label: cur.substr(1, cur.length-2)});
      } else {
        acc[acc.length-1].path = cur.substr(1, cur.length-2);
      }
      return acc;
    }, []);
  };
};

module.exports = {
  expect: expect,
  test: test,
  compare: compare,
  matchFn: matchFn
};
