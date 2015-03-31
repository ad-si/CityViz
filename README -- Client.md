# CityViz -- Client Readme

## Setup

- clone repository from github  - https://github.com/adius/CityViz
- npm install
- start mongodb 'mongod --dbpath db'
- import data 	'mongoimport --db cityViz --collection buildings --file buildings.json'
				'mongoimport --db cityViz --collection featureInfo --file featureInfo.json'
- unzip binaries and textures to /public
- run server	'node server.js'
- open browser with 'localhost:8080/public/index.html'


