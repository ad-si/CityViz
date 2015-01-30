var clone = require('clone')

module.exports = function(defaults, options){

	var key,
		returnObject

	returnObject = clone(options) || {}

	for (key in defaults)
		if (defaults.hasOwnProperty(key) &&
		    typeof returnObject[key] === 'undefined')
			returnObject[key] = defaults[key]

	return returnObject
}
