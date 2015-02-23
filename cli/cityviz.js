#! /usr/bin/env node

'use strict'

var path = require('path'),
	program = require('commander'),

	packageData = require('../package.json'),
	cityNode = require('../modules/cityNode')


process.argv[1] = __filename

program
	.version(packageData.version)
	.command('import', '<CityGML-file>|<directory with CityGML-files>')
	.command('setup', 'Setup the database')
	.command('dropdb', 'Drop the content of the database')
	.command('rdb-import', 'Import file(s) into RethinkDB')
	.parse(process.argv)


if (program.args.length < 1) {
	program.help()
}
