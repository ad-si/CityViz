#! /usr/bin/env node

'use strict'

var fs = require('fs'),
	path = require('path'),
	program = require('commander'),
	cityNode = require('../modules/cityNode'),
	citygml2gltf = require('../modules/citygml2gltf'),
	importPath,
	rdbWrapper = require('../src/index')


program.parse(process.argv)

if (program.args.length < 1) {
	console.error('Specify the file, files or directory to import.')
	process.exit()
}

if (String(program.args[0])[0] === '/')
	importPath = program.args[0]
else
	importPath = path.join(process.cwd(), program.args[0])

rdbWrapper
	.createTable()
	.then(function () {

		citygml2gltf({inputFile: importPath}, function (error, data) {

			if (error)
				throw error

			else {
				data
					.CityModel
					.cityObjects
					.forEach(function (cityObject, index) {

						rdbWrapper
							.insert(cityObject)
							.then(function () {
								console.log(
									'Imported cityobject ' + cityObject.gmlid
								)
							})
					})
			}
		})
	})
