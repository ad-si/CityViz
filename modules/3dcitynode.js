require('es6-promise').polyfill()

var fs = require('fs'),
	fsp = require('fs-promise'),
	fse = require('fs-extra'),
	path = require('path'),
	temp = require('temp'),
	childProcess = require('child_process'),

	parser = require('xml2json')


// TODO: Return promise when no callback is given

module.exports.export = function (midiBuffer, options, callback) {
	// TODO
}

module.exports.exportSync = function (midiBuffer, options) {
	// TODO
	return
}


module.exports.getFromDb = function (options, callback) {

	var defaults = {
			config: {}, // Config file containing project settings
			import: [], // Array of directories and files to import
			format: 'xml' // xml, kml, kmz
		},
		actualExportFile,
		shellCommand,
		configFile,
		exportFile,
		javaPath,
		key


	// Set defaults
	options = options || {}

	for (key in defaults)
		if (defaults.hasOwnProperty(key))
			options[key] = options[key] || defaults[key]


	if (options.id)
		options.config.kmlExport.filter.simple.gmlIds.gmlId = {$t: options.id}

	else if (options.ids)
		options.config.kmlExport.filter.simple.gmlIds.gmlId = options
			.ids.map(function (id) {
				return {$t: id}
			})

	configFile = temp.path()

	fs.writeFileSync(
		configFile,
		'<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
		parser.toXml(options.config)
	)

	exportFile = path.resolve(__dirname, '..', options.outputFile) || temp.path()
	actualExportFile = path.join(
		path.dirname(exportFile),
		path.basename(exportFile, path.extname(exportFile)) +
		'_collada.' + options.format
	)

	javaPath = process.env.JAVA_HOME ?
	           process.env.JAVA_HOME + '/bin/java' :
	           'java'


	shellCommand = [
		javaPath,
		'-jar',
		'-Xms128m',
		'-Xmx768m',
		'lib/3dcitydb-impexp.jar',
		'-shell',
		(options.format === 'xml') ? '-export' : '-kmlExport',
		exportFile,
		'-config ' + configFile
	].join(' ')

	process.chdir('/Applications/3DCityDB-Importer-Exporter')

	console.log(shellCommand)

	childProcess.exec(
		shellCommand,
		function (error, stdout, stderr) {

			if (error)
				return callback(error)

			console.log(stdout.toString())
			console.error(stderr.toString())

			fsp
				.remove(configFile)
				.catch(function (error) {
					throw error
				})

			fsp
				.move(actualExportFile, exportFile, {clobber: true})
				.then(function () {
					return fsp.readFile(exportFile)
				})
				.then(function (data) {
					if (!options.outputFile)
						callback(null, data)
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

module.exports.renderFileSync = function (filePath, options) {
	// TODO
	return
}
