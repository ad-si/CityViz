#! /usr/bin/env node

var program = require('commander'),
	packageData = require('../package.json')


program
	.version(packageData.version)
	.parse(process.argv)

if (program.args < 1) {
	program.help()
}
