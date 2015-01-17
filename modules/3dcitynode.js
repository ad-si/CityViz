var fs = require('fs'),
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


	configFile = temp.path()
	fs.writeFileSync(
		configFile,
		'<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
		parser.toXml(options.config)
	)

	exportFile = temp.path()

	fs.closeSync(fs.openSync(exportFile, 'w'))

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
	]

	process.chdir('/Applications/3DCityDB-Importer-Exporter')

	childProcess.exec(
		shellCommand.join(' '),
		function (error, stdout, stderr) {

			if (error)
				return callback(error)

			console.log(stdout.toString())
			console.error(stderr.toString())

			fs.unlink(configFile, function (error) {
				if (error && error.code !== 'ENOENT')
					throw error
			})

			fs.readFile(
				exportFile + '_collada.' + options.format, {},
				function (error, data) {

					if (error)
						return callback(error)
					else
						callback(null, data)
				}
			)

			fs.unlink(exportFile, function (error) {
				if (error && error.code !== 'ENOENT')
					throw error
			})
		}
	)
}

module.exports.renderFileSync = function (filePath, options) {
	// TODO
	return
}
