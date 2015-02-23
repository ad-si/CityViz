#! /usr/bin/env node

var path = require('path'),
	citygml2gltf = require('../index.js'),
	inputFile = path.resolve(process.cwd(), process.argv[2]),
	outputFile = path.resolve(process.cwd(), process.argv[3])


citygml2gltf(
	{
		inputFile: inputFile,
		//outputFile: outputFile,
		beautify: true
	},
	function (error, data) {
		if (error)
			throw error
		else {
			if (data)
				console.log(
					JSON.stringify(
						data.CityModel.cityObjects[0],
						null,
						2
					)
				)
			else
				console.log('Data was converted')
		}
	}
)



