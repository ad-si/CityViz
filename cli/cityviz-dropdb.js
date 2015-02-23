#! /usr/bin/env node

'use strict'

var path = require('path'),
	program = require('commander'),
	cityNode = require('../modules/cityNode')


program.parse(process.argv)

if (program.args.length > 1) {
	console.error('Setup does not have any configuration parameters.')
}
else {
	return cityNode.dropDatabase()
}
