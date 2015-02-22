#! /usr/bin/env node

var path = require('path'),
	citygml2gltf = require('../index.js'),
	inputFile = path.resolve(process.cwd(), process.argv[2]),
	outputFile = path.resolve(process.cwd(), process.argv[3])


citygml2gltf(
	{
		inputFile: inputFile,
		outputFile: outputFile
	},
	function (error, data) {
		if (error)
			throw error
		else
			console.log('Data was converted')
	}
)



