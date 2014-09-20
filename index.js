'use strict';

var through = require('through2');
var glob = require('glob');
var path = require('path');
module.exports = function (file, opts) {
	var data = '';

	return through(transform, flush);

	function transform (chunk, enc, cb) {
		data += chunk;
		cb();
	}

	function flush (cb) {
		var relativeToFile = path.dirname(file);

		var globRequires = data.match(/requireGlob\(("|')([^;]+)("|')\s*\);/g);
		if (Array.isArray(globRequires)) {
			globRequires.forEach(function (expr){
				var globExpr = expr.match(/("|')([^"]+)("|')\s*/g)[0];
				globExpr = globExpr.substring(1, globExpr.length-1);
				var requires = '';
				var files = glob.sync(globExpr, {cwd: relativeToFile});
				if (files.length === 0) {
					console.warn("Glob expression " + globExpr + " failed to find any files");
				}
				files.forEach(function (file){
					requires += 'require("' + file + '");\r\n';
				});
				data = data.replace(expr, requires);
			});
		}

		this.push(data);
		cb();
	}
};