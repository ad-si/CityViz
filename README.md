# CityViz

## Getting Started

Clone repository from [projects.hpi3d.de](https://projects.hpi3d.de) website like this:
`$ git clone https://projects.hpi3d.de/git/06-webgl-client`

If you get a warning about SSL problems try following:
´git -c http.sslVerify=false clone https://projects.hpi3d.de/git/06-webgl-client`


## Installation of 3DCityDB and postgres

On Mac:

1. Install [postgresapp](http://postgresapp.com) (Already contains PostGIS plugin which otherwise would have to be installed as well.)
2. Download [3DCityDB](http://3dcitydb.org/3dcitydb/downloads)
3. Run setup.jar to install 3DCityDB
4. Create a new database in postgres and enable the postgis extension for it. (You can use [pagadmin](http://pgadmin.org) to inspect and interact with your database.)
4. Open `/Applications/3DCityDB-Importer-Exporter/3dcitydb/postgis/CREATE_DB.sh` with a text-editor and adapt the exported variables to your settings.
	Then create the necessary schemas and tables by executing this shell-script.
6. Open the 3D City Database Importer/Exporter and connect to the database.
	(By executing `$ /Applications/3DCityDB-Importer-Exporter/3DCityDB-Importer-Exporter.sh`)
7. Import your files with the Importer/Exporter.


## Links

- [github.com/rmx/collada-converter](https://github.com/rmx/collada-converter) - A library for converting COLLADA files to a format suitable for WebGL
- https://github.com/rmx/threejs-collada
- https://github.com/KhronosGroup/glTF
- http://f4map.com
- http://lo-th.github.io/3d.city
- https://github.com/mrdoob/three.js/issues/5708
- https://arcgis.com - Gives everyone in your organization the ability to discover, use, make and share maps.


### Viewer

- http://www.glge.org/
- http://www.senchalabs.org/philogl/demos.html
- http://scenejs.org
- https://github.com/mapbox/mapbox-gl-js
- https://github.com/evanw/lightgl.js


### WebGL Resources

http://learningwebgl.com
http://webacademy.com
