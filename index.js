'use strict'

var fs = require('fs'),
	yaml = require('js-yaml'),

	cityNode = require('./modules/3dcitynode'),
	projectConfigYaml = fs.readFileSync('./config.yaml'),
	options = {
		format: 'kml' // Default xml
	}


options.config = yaml.safeLoad(projectConfigYaml)

cityNode.getFromDb(
	options,
	function (error, buffer) {
		if (error)
			console.error(error)
		else
			console.log(buffer.toString('utf8'))
	}
)
