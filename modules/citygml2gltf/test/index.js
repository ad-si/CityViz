var path = require('path'),
	util = require('util'),
	citygml2gltf = require('../index.js'),
	inputFile = path.resolve(__dirname, './4-52-NOORD_KETHEL.xml')

function inspect (item) {
	console.log(util.inspect(
		item,
		{
			depth: null,
			colors: true
		}
	))
}

describe('Citygml2gltf', function () {
	it('Converts a citygml file to a gltf array', function () {

		this.timeout('5s')

		citygml2gltf(
			{
				inputFile: inputFile,
				beautify: true
			},
			function (error, data) {
				if (error)
					throw error

				else {
					inspect(data.CityModel.cityObjects[0])
				}
			}
		)
	})
})



