require('es6-promise').polyfill()

var fs = require('fs'),
	fsp = require('fs-promise'),
	path = require('path'),
	temp = require('temp'),
	childProcess = require('child_process')


module.exports = function (options, callback) {

	var binPath;
	var defaults = {
			binPath: '',
			format: 'gltf',
			version: '0.8.0',
			inputFile: '',
			configFile: '',
			outputFile: '',
			outputBundle: '',
			exportAnimations: true,
			invertTransparency: false,
			exportPassDetails: false,
			showProgress: false,
			defaultLighting: true,
			compressionType: 'Open3DGC',
			compressionMode: 'ascii', //binary
			experimentalMode: false,
			verbose: false
		},
		shellCommand,
		exportFile,
		key


	// Set defaults
	options = options || {}

	for (key in defaults)
		options[key] = options[key] || defaults[key]


	exportFile = options.outputFile || temp.path()


	binPath = options.binPath ||
	          path.join(__dirname, 'bin', options.version, 'collada2gltf')

	// TODO: Use config file

	shellCommand = [
		binPath,
		'-f ' + options.inputFile,
		'-o ' + exportFile,
		options.outputBundle ? '-b ' + options.outputBundle : '',
		options.exportAnimations ? '-a ' + options.exportAnimations : '',
		options.invertTransparency ? '-i' : '',
		options.exportPassDetails ? '-d' : '',
		options.showProgress ? '-p' : '',
		options.defaultLighting ? '-l ' + options.defaultLighting : '',
		options.compressionType ? '-c ' + options.compressionType : '',
		options.compressionMode ? '-m ' + options.compressionMode : '',
		options.experimentalMode ? '-s' : '',
		options.verbose ? '-r' : ''
	].join(' ')

	console.log(shellCommand)

	childProcess.exec(
		shellCommand,
		function (error, stdout, stderr) {

			if (error)
				return callback(error)

			console.log(stdout.toString())
			console.error(stderr.toString())

			// fsp
			// 	.remove(configFile)
			// 	.catch(function (error) {
			// 		setTimeout(function () {
			// 			throw error
			// 		}, 0)
			// 	})

			if (!options.outputFile)
				fsp
					.readFile(exportFile)
					.then(function (data) {
						callback(null, data)
					})
					.then(function () {
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
