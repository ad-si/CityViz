#! /usr/bin/env node

'use strict'

var path = require('path'),
	program = require('commander'),
	cityNode = require('../modules/cityNode'),
	importPath


program.parse(process.argv)

if (program.args.length < 1) {
	console.error('Specify the file, files or directory to import.')
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
