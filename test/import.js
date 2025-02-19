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
		importFile: path.join(__dirname, 'fixtures', 'cityGml'),
		//importFiles: [
		//	path.resolve(__dirname, '../build', fileName + '1.kml'),
		//	path.resolve(__dirname, '../build', fileName + '2.kml')
		// ]
		config: yaml.safeLoad(projectConfigYaml)
	}


describe('Import', function () {
	it('should import', function (done) {

		this.timeout('150s')

		cityNode.import(
			options,
			function (error) {
				if (error)
					done(error)
				else
					done()
			}
		)
	})
})
