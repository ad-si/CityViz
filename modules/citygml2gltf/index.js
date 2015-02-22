var fs = require('fs'),
	parser = require('xml2json')


module.exports = function(options, callback){

	var	output,
		input

	if (Buffer.isBuffer(options))
		input = options
	else
		input = fs.readFileSync(options.inputFile)

	try {
		output = parser.toJson(input)
	}
	catch(error){
		return callback(error)
	}

	if(options.outputFile){
		fs.writeFileSync(options.outputFile, output)
		callback()
	}
	else
		callback(null, output)
}
