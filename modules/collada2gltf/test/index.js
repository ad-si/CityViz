var collada2gltf = require('../index.js')

collada2gltf(
	{
		inputFile: './testModel/testModel.dae',
		outputFile: './testModel.gltf'
	},
	function (error) {
		if (error)
			throw error
	}
)
