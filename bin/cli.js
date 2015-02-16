#! /usr/bin/env node

'use strict'

var path = require('path'),
	program = require('commander'),

	packageData = require('../package.json'),
	cityNode = require('../modules/cityNode'),
	importPath


program
	.version(packageData.version)
	.usage('<CityGML-file>|<directory with CityGML-files>')
	.option('--setup-db', 'Setup the database')
	.option('--drop-db', 'Drop the content of the database')
	.parse(process.argv)


if (program.setupDb)
	return cityNode.setupDatabase()

if (program.dropDb)
	return cityNode.dropDatabase()

if (program.args.length < 1) {
	program.help()
}
else {

	if (String(program.args[0])[0] === '/')
		importPath = program.args[0]
	else
		importPath = path.join(process.cwd(), program.args[0])

	cityNode.import(
		{
			importFile: importPath
		},
		function (error) {
			if (error)
				throw error
		}
	)
}
