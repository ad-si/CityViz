var path = require('path'),
	fs = require('fs'),
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
			export: 'fileName', // Export data to this file
			import: [], // Array of directories and files to import
			kmlExport: 'fileName' // Export KML/COLLADA data to this file
		},
		shellCommand,
		configFile,
		exportFile,
		key


	// Set defaults
	options = options || {}

	for (key in defaults)
		if (defaults.hasOwnProperty(key))
			options[key] = options[key] || defaults[key]


	configFile = path.resolve(__dirname, '../build/config.xml') //temp.path()
	fs.writeFileSync(
		configFile,
		'<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
		parser.toXml(options.config)
	)

	exportFile = path.resolve(__dirname, '../build/export') // temp.path()

	fs.closeSync(fs.openSync(exportFile, 'w'))

	// TODO: Use JAVA_HOME environment variable
	shellCommand = [
		'/Library/Java/JavaVirtualMachines/jdk1.8.0_25.jdk/Contents/Home/bin/java',
		'-jar',
		'-Xms128m',
		'-Xmx768m',
		'lib/3dcitydb-impexp.jar',
		'-shell',
		(options.format === 'xml') ? '-export' : '-kmlExport',
		exportFile,
		//'-config  /Users/adrian/3DCityDB-Importer-Exporter/config/project.xml'
		'-config ' + path.resolve(__dirname, '../build/config.xml')
		//'-config ' + configFile
	]

	console.log('Execute:', shellCommand.join(' '))

	process.chdir('/Applications/3DCityDB-Importer-Exporter')

	process.cwd()

	childProcess.exec(
		shellCommand.join(' '),
		function (error, stdout, stderr) {

			if (error) {
				callback(error)
				return
			}

			console.log(stdout.toString())
			console.error(stderr.toString())

			fs.readFile(exportFile, {}, function (error, data) {

				if (error) {
					callback(error)
					return
				}
				else
					callback(null, data)

				/*fs.unlink(exportFile, function (error) {
				 if (error && error.code !== 'ENOENT') {
				 console.error('Delete temp export file…')
				 throw error
				 }
				 })
				 */
			})
		}
	)
}

module.exports.renderFileSync = function (filePath, options) {
	// TODO
	return
}
