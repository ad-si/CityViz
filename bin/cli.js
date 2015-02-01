#! /usr/bin/env node

var program = require('commander'),
	packageData = require('../package.json'),
	cityNode = require('modules/cityNode')


program
	.version(packageData.version)
	.usage('<CityGML-file>|<directory with CityGML-files>')
	.parse(process.argv)

if (program.args < 1) {
	program.help()
}
else {
	cityNode.import(program.args[0])
}
