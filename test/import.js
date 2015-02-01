'use strict'

var fs = require('fs'),
	path = require('path'),
	yaml = require('js-yaml'),

	cityNode = require(path.join('..', 'modules', 'cityNode')),
	collada2gltf = require(path.join('..', 'modules', 'collada2gltf')),

	projectConfigYaml = fs.readFileSync(
		path.resolve(__dirname, '../config.yaml')
	),

	options = {
		importDir: path.join(__dirname, 'fixtures', 'cityGml'),
		//importFiles: [
		//	path.resolve(__dirname, '../build', fileName + '1.kml'),
		//	path.resolve(__dirname, '../build', fileName + '2.kml')
		// ]
		config: yaml.safeLoad(projectConfigYaml)
	}


describe('import', function () {
	it.skip('should import', function (done) {

		cityNode.import(
			options,
			function (error) {
				if (error)
					throw error

				console.log('Successfully imported CityGML files.')
				done()
			}
		)
	})
})
