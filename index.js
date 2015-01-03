'use strict'

var fs = require('fs'),
	yaml = require('js-yaml'),
	parser = require('xml2json'),

	projectConfig = fs.readFileSync('./config.yaml'),
	xml = parser.toXml(yaml.safeLoad(projectConfig))


fs.writeFileSync('./build/tempConfig.xml', xml)


