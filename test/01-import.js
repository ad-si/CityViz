'use strict'

var fs = require('fs'),
	path = require('path'),
	yaml = require('js-yaml'),
	assert = require('assert'),
	childProcess = require('child_process'),

	cityNode = require(path.join('..', 'modules', 'cityNode')),

	projectConfigYaml = fs.readFileSync(
		path.resolve(__dirname, '../config.yaml')
	),

	options = {
		importFile: path.join(__dirname, 'fixtures', 'cityGml'),
		config: yaml.load(projectConfigYaml)
	}


function countBuildings(callback) {
	// class_id 26 = Building in 3DCityDB OBJECTCLASS table.
	// Uses psql directly because pg@4.x hangs on the PG14 wire
	// protocol under modern Node.
	childProcess.exec(
		'PGPASSWORD=cityviz psql -h localhost -U cityviz -d cityviz ' +
		'-tA -c "SELECT count(*) FROM cityobject WHERE class_id = 26"',
		function (error, stdout) {
			if (error)
				return callback(error)
			callback(null, parseInt(stdout.trim(), 10))
		}
	)
}


describe('Import', function () {

	before(function (done) {
		// Ensure a clean DB so the row-count assertion proves the
		// import actually inserted something on this run.
		childProcess.exec(
			'PGPASSWORD=cityviz psql -h localhost -U cityviz -d cityviz ' +
			'-c "TRUNCATE cityobject CASCADE"',
			function (error) {
				done(error)
			}
		)
	})

	it('should import', function (done) {

		this.timeout('150s')

		cityNode.import(
			options,
			function (error) {
				if (error)
					return done(error)

				countBuildings(function (countError, count) {
					if (countError)
						return done(countError)

					assert(
						count > 0,
						'Import reported success but cityobject ' +
						'contains no buildings — features were ' +
						'silently dropped by the impexp tool.'
					)
					done()
				})
			}
		)
	})
})
