'use strict'

var fs = require('fs'),
	path = require('path'),
	yaml = require('js-yaml'),

	cityNode = require('./modules/3dcitynode'),
	projectConfigYaml = fs.readFileSync('./config.yaml'),
	collada2gltf = require('./modules/collada2gltf'),
	fileName = 'building',
	options = {
		format: 'kml',
		outputFile: path.join('./build', fileName + '.kml'),
		id: 'UUID_b960fd73-ae5b-4259-b6cf-768abd303c7d',
		ids: null,
		config: yaml.safeLoad(projectConfigYaml)
	}


cityNode.getFromDb(
	options,
	function (error) {
		if (error)
			throw error

		collada2gltf(
			{
				inputFile: path.join(
					__dirname, 'build', options.id, options.id + '.dae'
				),
				outputFile: path.join(
					__dirname, 'build', fileName + '.gltf')
			},
			function (error) {
				if(error)
					throw error
				console.log('test')
			}
		)
	}
)
