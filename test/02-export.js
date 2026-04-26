'use strict'

var fse = require('fs-extra'),
	path = require('path'),
	yaml = require('js-yaml'),
	childProcess = require('child_process'),

	cityNode = require(path.join('..', 'modules', 'cityNode')),
	collada2gltf = require(path.join('..', 'modules', 'collada2gltf')),

	projectConfigYaml = fse.readFileSync(
		path.resolve(__dirname, '../config.yaml')
	),
	fileName = 'building',
	config = yaml.safeLoad(projectConfigYaml)


describe('Export & Conversion', function () {

	var buildDir = path.join(__dirname, 'build'),
		options

	before(function (done) {
		fse.ensureDirSync(buildDir)

		// class_id 26 = Building in 3DCityDB OBJECTCLASS table.
		// Picks any imported building so the test isn't tied to a
		// specific gml:id that may not exist in the fixtures.
		// Uses psql directly because the bundled pg@4.x client hangs
		// when negotiating the PG14 wire protocol on modern Node.
		childProcess.exec(
			'PGPASSWORD=cityviz psql -h localhost -U cityviz -d cityviz ' +
			'-tA -c "SELECT gmlid FROM cityobject ' +
			'WHERE class_id = 26 LIMIT 1"',
			function (error, stdout) {
				if (error)
					return done(error)

				var gmlid = stdout.trim()

				if (!gmlid)
					return done(new Error(
						'No buildings in DB; import test must run first'
					))

				options = {
					format: 'kml',
					id: gmlid,
					outputFile: path.join(buildDir, fileName + '.kml'),
					config: config
				}
				done()
			}
		)
	})

	it('should export a collada file', function (done) {

		this.timeout('15s')

		cityNode.getFromDb(
			options,
			function (error) {
				if (error)
					done(error)
				else
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
						done(error)
					else
						done()
				}
			)
		}
	)

	after(function () {
		fse.remove(buildDir)
	})
})
