var path = require('path'),
	citygml2gltf = require('../index.js'),
	inputFile = path.resolve(__dirname, './4-52-NOORD_KETHEL.xml')


describe('Citygm2gltf', function () {
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
					//console.log(
					//	JSON.stringify(data.CityModel.cityObjects[0], null, 2)
					//)
				}
			}
		)
	})
})



