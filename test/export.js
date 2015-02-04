'use strict'

var fse = require('fs-extra'),
	path = require('path'),
	yaml = require('js-yaml'),

	cityNode = require(path.join('..', 'modules', 'cityNode')),
	collada2gltf = require(path.join('..', 'modules', 'collada2gltf')),

	projectConfigYaml = fse.readFileSync(
		path.resolve(__dirname, '../config.yaml')
	),
	fileName = 'building',
	options = {
		format: 'kml',
		id: 'UUID_b960fd73-ae5b-4259-b6cf-768abd303c7d',
		outputFile: path.join(__dirname, 'build', fileName + '.kml'),
		//outputFiles: [
		//	path.resolve(__dirname, '../build', fileName + '1.kml'),
		//	path.resolve(__dirname, '../build', fileName + '2.kml')
		//],
		//ids: [
		//	'UUID_b960fd73-ae5b-4259-b6cf-768abd303c7d',
		//	'UUID_894b8840-054d-41ff-af45-07139d5fdd7a '
		//],
		config: yaml.safeLoad(projectConfigYaml)
	}


describe('Export & Conversion', function () {

	var buildDir = path.join(__dirname, 'build')

	before(function () {
		fse.ensureDirSync(buildDir)
	})

	it('should export a collada file', function (done) {

		this.timeout('15s')

		cityNode.getFromDb(
			options,
			function (error) {
				if (error)
					throw error

				done()
			})
	})

	it('should convert the collada file to gltf', function (done) {

			collada2gltf(
				{
					inputFile: path.resolve(
						__dirname, 'build', options.id, options.id + '.dae'
					),
					outputFile: path.join(
						__dirname, 'build', fileName + '.gltf'
					),
					compressionMode: 'binary'
				},
				function (error) {
					if (error)
						throw error

					done()
				}
			)
		}
	)

	after(function () {
		fse.remove(buildDir)
	})
})
