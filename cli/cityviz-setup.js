#! /usr/bin/env node

'use strict'

var path = require('path'),
	Command = require('commander').Command,
	program = new Command(),
	cityNode = require('../modules/cityNode')


program.parse(process.argv)

if (program.args.length > 1) {
	console.error('Setup does not have any configuration parameters.')
}
else {
	return cityNode.setupDatabase()
}
