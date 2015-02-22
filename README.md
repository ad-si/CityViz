# CityViz

## Getting Started

1. Clone repository from [projects.hpi3d.de](https://projects.hpi3d.de)
	website like this:
	`$ git clone https://projects.hpi3d.de/git/06-webgl-client`

	If you get a warning about SSL problems try following:
	`git -c http.sslVerify=false clone https://projects.hpi3d.de/git/06-webgl-client`
1. Run `$ npm install` to install all dependencies
1. Start postgres server
1. Run `$ cityviz setup` to create the CityViz database
1. Run `$ cityviz import <citygml-file|directory>` to import specified files
1. Run `$ cityviz serve` to start server
1. Open [localhost:3000](http://localhost:3000)

You can use `$ cityviz dropdb` to drop the CityViz database.


## Detailed Installation

This should be used if any errors occur during the getting started process.

On Mac:

1. Install [postgresapp](http://postgresapp.com)
	(Already contains PostGIS plugin which otherwise
	would have to be installed as well)
1. Follow the instructions on [postgresapp.com/documentation
	](http://postgresapp.com/documentation/cli-tools.html) to add the `psql`
	command to your command line.
1. Download [3DCityDB](http://3dcitydb.org/3dcitydb/downloads)
1. Run setup.jar to install 3DCityDB
1.
	- Create a new database in postgres
		(You can use [pagadmin](http://pgadmin.org) to inspect and interact
		with your database.)
	- Enable the postgis extension for it by
		right clicking Extensions > name: postgis > OK.
1. Open `/Applications/3DCityDB-Importer-Exporter/3dcitydb/postgis/CREATE_DB.sh`
	with a text-editor and adapt the exported variables to your settings.

	Then create the necessary schemas and tables by executing this shell-script.
	(For the Rotterdam model use SRID: 28992 and name EPSG: 28992)
1. Open the 3D City Database Importer/Exporter by executing
	`$ /Applications/3DCityDB-Importer-Exporter/3DCityDB-Importer-Exporter.sh`
	and connect to the database
1. Import your files with the Importer/Exporter.


## Usage

First you need to set the database settings in `config.yaml`
according to your environment.
In order to get an overview over available commands run the cli script:
`$ node ./bin/cli.js --help`


## Links

- [rmx/collada-converter](https://github.com/rmx/collada-converter) -
	A library for converting COLLADA files to a format suitable for WebGL
- [rmx/threejs-collada](https://github.com/rmx/threejs-collada)
- [KhronosGroup/glTF](https://github.com/KhronosGroup/glTF)
- [f4map](http://f4map.com)
- [lo-th.github.io/3d.city](http://lo-th.github.io/3d.city)
- [https://github.com/mrdoob/three.js/issues/5708](mrdoob/three.js/issues/5708)
- [arcgis](https://arcgis.com) -
	Gives everyone in your organization the ability to discover,
	use, make and share maps.


### Viewer

- [glge](http://glge.org)
- [senchalabs.org/philogl/demos](http://senchalabs.org/philogl/demos.html)
- [scenejs](http://scenejs.org)
- [mapbox/mapbox-gl-js](https://github.com/mapbox/mapbox-gl-js)
- [evanw/lightgl.js](https://github.com/evanw/lightgl.js)


### WebGL Resources

- [learningwebgl.com](http://learningwebgl.com)
- [webacademy.com](http://learningwebgl.com)
