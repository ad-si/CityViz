'use strict'

var fs = require('fs'),
	path = require('path'),
	yaml = require('js-yaml'),

	cityNode = require(
		path.resolve(__dirname, '../modules/cityNode')
	),
	projectConfigYaml = fs.readFileSync(
		path.resolve(__dirname, '../config.yaml')
	),
	collada2gltf = require(
		path.resolve(__dirname, '../modules/collada2gltf')
	),

	fileName = 'building',
	options = {
		format: 'kml',
		//outputFile: path.resolve(__dirname, '../build', fileName + '.kml'),
		outputFiles: [
			path.resolve(__dirname, '../build', fileName + '1.kml'),
			path.resolve(__dirname, '../build', fileName + '2.kml')
		],
		//id: 'UUID_b960fd73-ae5b-4259-b6cf-768abd303c7d',
		ids: [
			//'UUID_b960fd73-ae5b-4259-b6cf-768abd303c7d',
			'UUID_894b8840-054d-41ff-af45-07139d5fdd7a '
		],
		config: yaml.safeLoad(projectConfigYaml)
	}


cityNode.getFromDb(
	options,
	function (error) {
		if (error)
			throw error

		//collada2gltf(
		//	{
		//		inputFile: path.resolve(
		//			__dirname, '../build', options.id, options.id + '.dae'
		//		),
		//		outputFile: path.join(
		//			__dirname, '../build', fileName + '.gltf'
		//		),
		//		compressionMode: 'binary'
		//	},
		//	function (error) {
		//		if(error)
		//			throw error
		//		console.log('test')
		//	}
		//)
	}
)
