var hash = require('./scripts/*.js', {hash: true});		//should end up as two requires

//require('./not_included/*.js', {hash: true});		//should not be included
