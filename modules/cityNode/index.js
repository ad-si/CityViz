'use strict'

require('es6-promise').polyfill()

var fs = require('fs'),
	fsp = require('fs-promise'),
	fse = require('fs-extra'),
	path = require('path'),
	temp = require('temp'),
	childProcess = require('child_process'),

	parser = require('xml2json'),

	applyDefaults = require('../applyDefaults'),

	javaPath = process.env.JAVA_HOME ?
	           process.env.JAVA_HOME + '/bin/java' :
	           'java'


function executeShellCommand (shellCommand, options, exportFile, actualExportFile, callback) {

	var configFile = temp.path()

	fs.writeFileSync(
		configFile,
		'<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
		parser.toXml(options.config)
	)

	process.chdir('/Applications/3DCityDB-Importer-Exporter')

	shellCommand = shellCommand + ' -config ' + configFile

	//console.log(shellCommand)

	childProcess.exec(
		shellCommand,
		function (error, stdout, stderr) {

			var stdoutText = stdout.toString(),
				stderrText = stderr.toString()

			console.log(stdoutText)

			if (stderrText)
				return callback(new Error(stderrText))

			if (stdoutText.search(/error/gi) > 0)
				return callback(new Error(stdoutText))

			if (error)
				return callback(error)

			fsp
				.remove(configFile)
				.catch(function (error) {
					setTimeout(function () {
						throw error
					}, 0)
				})

			fsp
				.move(actualExportFile, exportFile, {clobber: true})
				.then(function () {
					return fsp.readFile(exportFile)
				})
				.then(function (data) {
					if (!options.outputFile)
						callback(null, data)
					else
						callback()
				})
				.then(function () {
					if (!options.outputFile)
						return fs.remove(exportFile)
				})
				.catch(function (error) {
					setTimeout(function () {
						throw error
					}, 0)
				})
		}
	)
}

// TODO: Return promise when no callback is given

module.exports.export = function (midiBuffer, options, callback) {
	// TODO
}

module.exports.exportSync = function (midiBuffer, options) {
	// TODO
	return
}


module.exports.import = function (options, callback) {
	var defaults = {
		config: {}, // Config file containing project settings
		import: [], // Array of directories and files to import
	}

	if (options.id)
		options.config
			.project
			.kmlExport
			.filter
			.simple
			.gmlIds
			.gmlId = {$t: options.id}
}


module.exports.getFromDb = function (options, callback) {

	var defaults = {
			config: {}, // Config file containing project settings
			import: [], // Array of directories and files to import
			format: 'xml' // xml, kml, kmz
		},
		actualExportFile,
		shellCommand,
		exportFile


	applyDefaults(defaults, options)

	if (options.id)
		options.config
			.project
			.kmlExport
			.filter
			.simple
			.gmlIds
			.gmlId = {$t: options.id}

	else if (options.ids)
		options.config
			.project
			.kmlExport
			.filter
			.simple
			.gmlIds
			.gmlId = options.ids.map(function (id) {
			return {$t: id}
		})

	exportFile = path.resolve(__dirname, '..', options.outputFile) || temp.path()
	actualExportFile = path.join(
		path.dirname(exportFile),
		path.basename(exportFile, path.extname(exportFile)) +
		'_collada.' + options.format
	)


	shellCommand = [
		javaPath,
		'-jar',
		'-Xms128m',
		'-Xmx768m',
		'lib/3dcitydb-impexp.jar',
		'-shell',
		(options.format === 'xml') ? '-export' : '-kmlExport',
		exportFile
	].join(' ')

	executeShellCommand(
		shellCommand,
		options,
		exportFile,
		actualExportFile,
		callback
	)
}

module.exports.renderFileSync = function (filePath, options) {
	// TODO
	return
}
