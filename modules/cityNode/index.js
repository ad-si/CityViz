'use strict'

require('es6-promise').polyfill()

var fs = require('fs'),
	fsp = require('fs-promise'),
	fse = require('fs-extra'),
	path = require('path'),
	temp = require('temp'),
	childProcess = require('child_process'),

	parser = require('xml2json'),
	pg = require('pg'),

	applyDefaults = require('../applyDefaults'),

	javaPath = process.env.JAVA_HOME ?
	           process.env.JAVA_HOME + '/bin/java' : 'java',
	programDirectory = '/Applications/3DCityDB-Importer-Exporter',
	executable = 'lib/3dcitydb-impexp.jar',
	intitalDbConnectionString = 'postgres://adrian:cityviz@localhost/postgres',
	dbConectionString = 'postgres://adrian:cityviz@localhost/cityViz'


function executeShellCommand (shellCommand, options, exportFile,
                              actualExportFile, callback) {

	var configFile = temp.path()

	fs.writeFileSync(
		configFile,
		'<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
		parser.toXml(options.config)
	)

	shellCommand = shellCommand + ' -config ' + configFile

	process.chdir(programDirectory)
	console.log('Changed directory to ' + programDirectory)

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

			if (exportFile && actualExportFile) {
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
			else
				callback()
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


module.exports.dropDatabase = function () {

	// stackoverflow.com/questions/20813154/node-postgres-create-database

	pg.connect(intitalDbConnectionString, function (error, client, done) {
		if (error)
			throw error

		client.query(
			'drop database if exists "cityViz"',
			function (error, result) {
				done()

				if (error)
					throw error

				console.log(result)
			})
	})
}


module.exports.import = function (options, callback) {

	var defaults = {
			test: 'test'
		},
		shellCommand,
		imports


	options = applyDefaults(defaults, options)

	if (options.importFile)
		imports = options.importFile

	else if (options.importFiles)
		imports = options.importFiles.join(' ')

	else
		callback(new Error('Specify an import file!'))

	//options.config
	//		.project
	//		.import
	//		.path
	//		.standardPath = {$t: __dirname + 'citymodel'}

	shellCommand = [
		javaPath,
		'-jar',
		'-Xms128m',
		'-Xmx768m',
		executable,
		'-shell',
		'-import',
		imports
	].join(' ')

	executeShellCommand(
		shellCommand,
		options,
		null,
		null,
		callback
	)
}


module.exports.getFromDb = function (options, callback) {

	var defaults = {
			format: 'xml' // xml, kml, kmz
		},
		actualExportFile,
		shellCommand,
		exportFile


	options = applyDefaults(defaults, options)

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
		executable,
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
