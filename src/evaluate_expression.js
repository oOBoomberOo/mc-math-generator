const math = require('mathjs');

exports.eval = function(string, callback) {
	try {	
		let result = math.eval(string);
		return callback(result, null);
	} catch (error) {
		return callback(null, error);
	}
}

exports.isNumeric = function(test) {
	try {
		if (math.isNumeric(test)) {
			return true;
		}
	} catch (error) {
		return false;
	}
}
