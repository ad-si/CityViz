#! /usr/bin/env node

'use strict'

var program = require('commander'),

	packageData = require('../package.json'),
	cityNode = require('../modules/cityNode')


program
	.version(packageData.version)
	.usage('<CityGML-file>|<directory with CityGML-files>')
	.option('--drop-db', 'Drop the content of the database')
	.parse(process.argv)


if (program.dropDb)
	cityNode.dropDatabase()

else if (program.args.length < 1) {
	program.help()
}
else {
	cityNode.import(program.args[0])
}
