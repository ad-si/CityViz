'use strict'

var fs = require('fs'),
	path = require('path'),
	yaml = require('js-yaml'),

	cityNode = require(path.join('..', 'modules', 'cityNode')),
	collada2gltf = require(path.join('..', 'modules', 'collada2gltf')),

	projectConfigYaml = fs.readFileSync(
		path.resolve(__dirname, '../config.yaml')
	)


// TODO
