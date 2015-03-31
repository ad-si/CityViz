#! /usr/bin/env node

'use strict'

var fs = require('fs'),
	path = require('path'),
	util = require('util'),
	assert = require('assert'),

	program = require('commander'),

	cityNode = require('../modules/cityNode'),
	citygml2gltf = require('../modules/citygml2gltf'),
	importPath,
	rdbWrapper = require('../src/rdbWrapper.js')


function importFile(filePath, callback) {
	citygml2gltf(
		{inputFile: filePath},
		function (error, cityObjects) {

			if (error)
				throw error

			cityObjects = cityObjects
				.filter(function (item) {
					return item != null
				})
				.map(function (cityObject) {
					cityObject.fileName = path.basename(filePath, '.xml')
						.split('-')
						.slice(2)
						.join('-')
						.replace('_', ' ')
						.toLowerCase()

					return cityObject
				})

			process.stdout.write(
				'\n\nInsert ' +
				cityObjects.length +
				' cityObjects into database'
			)

			return rdbWrapper
				.insert(cityObjects)
				.then(function () {
					console.log(' ✔')

					if (callback && typeof callback === 'function')
						callback()
				})
		}
	)
}

function importLoop(files, index) {

	if (files[index]) {

		console.log(
			'\n\nImport file ' + (index + 1) + ' of ' + files.length + ': ' +
			files[index] + '\n'
		)

		importFile(files[index], function () {
			importLoop(files, ++index)
		})
	}
	else {
		console.log('\n\nImported all files!\n')
		console.timeEnd('Database import duration')
	}
}

function isXmlFile(path) {
	return /\.xml$/gi.test(path)
}

program.parse(process.argv)

if (program.args.length < 1) {
	console.error('Specify the file, files or directory to import.')
	process.exit()
}

if (String(program.args[0])[0] === '/')
	importPath = program.args[0]
else
	importPath = path.join(process.cwd(), program.args[0])

console.time('Database import duration')

fs.readdir(importPath, function (directoryError, filePaths) {

	rdbWrapper
		.createDatabase()
		.then(function () {
			return rdbWrapper.createTable()
		})
		.then(function () {

			if (directoryError)
				importFile(importPath)

			else {

				var xmlFiles = filePaths
					.filter(isXmlFile)
					.map(function (filePath) {
						return path.join(importPath, filePath)
					})

				console.log('\nImport ' + xmlFiles.length + ' files')

				importLoop(xmlFiles, 0)
			}
		})
})

