'use strict'

require('es6-promise').polyfill()

var fs = require('fs'),
	fsp = require('fs-promise'),
	fse = require('fs-extra'),
	path = require('path'),
	temp = require('temp'),
	childProcess = require('child_process'),

	parser = require('xml2json'),
	yaml = require('js-yaml'),
	pg = require('pg'),
	pgQuery = require('pg-query'),

	applyDefaults = require('../applyDefaults'),
	packageFile = require('../../package.json'),

	javaPath = process.env.JAVA_HOME ?
	           process.env.JAVA_HOME + '/bin/java' : 'java',
	programDirectory = '/Applications/3DCityDB-Importer-Exporter',
	importExportExecutable = path.resolve(
		__dirname, '../../node_modules/3dcitydb-importer-exporter' +
		           '/lib/3dcitydb-impexp.jar'
	),
	dbConfig = {
		port: 5432,
		host: 'localhost',
		user: 'cityviz',
		db: 'cityviz',
		srid: 28992
	},
	intitalDbString = 'postgres://' + process.env.USER + '@localhost/template1',
	dbString = 'postgres://cityviz:cityviz@localhost/cityviz',
	projectConfig = yaml.safeLoad(
		fs.readFileSync(
			path.resolve(__dirname, '../../config.yaml')
		)
	)


function executeShellCommand (additionalArguments, options, exportFile,
                              actualExportFile, callback) {

	var configFile = temp.path(),
		shellCommand,
		cliArguments = [
			javaPath,
			'-Xms128m',
			'-Xmx768m',
			'-jar',
			importExportExecutable,
			'-shell'
		]

	options.config = options.config || projectConfig

	fs.writeFileSync(
		configFile,
		'<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
		parser.toXml(options.config)
	)

	cliArguments = cliArguments
		.concat('-config', configFile, additionalArguments)

	//process.chdir(programDirectory)
	//console.log('Changed directory to ' + programDirectory)

	shellCommand = cliArguments.join(' ')
	console.log(shellCommand)


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


module.exports.setupDatabase = function () {


	function alreadyExists (error) {
		return error.message.search(/already exists/gi) !== -1
	}

	pgQuery.connectionParameters = intitalDbString

	pgQuery('create user cityviz with password "cityviz"')
		.then(
		function () {
			console.log('User created')
		},
		function (error) {
			if (alreadyExists(error))
				console.log(error.message)
			else
				throw error
		})

		.then(function () {
			return pgQuery('create database cityviz').then(
				function () {
					console.log('Database created')
				},
				function (error) {
					if (alreadyExists(error))
						console.log(error.message)
					else
						throw error
				}
			)
		})

		.then(function () {
			return pgQuery(
				'grant all privileges on database cityviz to cityviz').then(
				function () {
					console.log('Privileges granted')
				},
				function (error) {
					if (alreadyExists(error))
						console.log(error.message)
					else
						throw error
				})
		})

		.then(function () {
			return pgQuery('create extension postgis').then(
				function () {
					console.log('Created postgis extension')
				},
				function (error) {
					if (alreadyExists(error))
						console.log(error.message)
					else
						throw error
				})
		})

		.then(function () {
			return pgQuery('create extension postgis_topology').then(
				function () {
					console.log('Created postgis_topology extension')
				},
				function (error) {
					if (alreadyExists(error))
						console.log(error.message)
					else
						throw error
				})
		})

		.then(function () {
			return pgQuery('ALTER EXTENSION postgis SET SCHEMA public')
		})

		.then(function () {

			var sqlScriptsPath,
				psql


			sqlScriptsPath = path.resolve(
				__dirname,
				'../../node_modules',
				'3dcitydb-importer-exporter',
				'3dcitydb',
				'postgis'
			)

			// TODO: Use node-postgres instead
			psql = childProcess.spawn(
				'psql',
				[
					'cityviz',
					'-U',
					'cityviz',
					'-f',
					'CREATE_DB.sql'],
				{
					cwd: sqlScriptsPath
				}
			)

			psql.stdout.on('data', function (data) {
				var text = data.toString()

				console.log(text)

				if (text.search('valid SRID') !== -1)
					psql.stdin.write(dbConfig.srid + '\n')

				if (text.search('corresponding SRSName') !== -1)
					psql.stdin.write(dbConfig.srid + '\n')
			})
			psql.stderr.on('data', function (data) {
				console.error(data.toString())
			})
			psql.on('close', function (code) {
				console.log('child process exited with code ' + code)
				psql.stdin.end()
			})

			//{
			//	shell: '/bin/bash',
			//	env: {
			//		PGDATABASE: dbConfig.db,
			//		PGPORT: dbConfig.port,
			//		PGHOST: dbConfig.host,
			//		PGUSER: dbConfig.user//,
			//		//CITYDB: dbConfig.db,
			//		//PGBIN: dbConfig.binPath
			//	}
			//},
			//function (error, stdout, stderr) {
			//
			//	console.log(stdout)
			//	console.error(stderr)
			//
			//	if (error)
			//		throw error
			//}
		})
		.catch(function (error) {
			console.error(error)
		})
}


module.exports.dropDatabase = function () {

	pgQuery.connectionParameters = intitalDbString

	pgQuery(
		'drop database if exists cityviz',
		function (error, rows, result) {
			if (error)
				throw error

			console.log(result)
		}
	)
}


module.exports.import = function (options, callback) {

	var defaults = {
			test: 'test'
		},
		cliArguments,
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

	cliArguments = [
		'-import',
		imports
	]

	executeShellCommand(
		cliArguments,
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
		cliArguments,
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


	cliArguments = [
		(options.format === 'xml') ? '-export' : '-kmlExport',
		exportFile
	]

	executeShellCommand(
		cliArguments,
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
