var fs = require('fs'),
	parser = require('xml2json'),
	assert = require('assert')


function log (item) {
	console.log(JSON.stringify(item, null, 2))
}

function getOnlyProperty (object) {

	var keys = Object.keys(object)

	if (keys.length === 1)
		return object[keys[0]]
	else
		throw Error(JSON.stringify(object) + ' has more than one property!')
}

function getPosList (polygon, zeroPoint) {

	var coordsList = polygon
			['gml:Polygon']
			['gml:exterior']
			['gml:LinearRing']
			['gml:posList']
			.split(' '),
		coordObjects = [],
		i

	for (i = 0; i < coordsList.length; i += 3) {
		coordObjects.push({
			x: coordsList[i] - zeroPoint.x,
			y: coordsList[i + 1]- zeroPoint.y,
			z: coordsList[i + 2]- zeroPoint.z
		})
	}

	//assert.deepEqual(coordObjects[0], coordObjects.pop())

	return coordObjects
}

function convert (buildings, options) {

	return buildings
		.map(function (building, index) {

			if (index > 1)
				return 0

			//console.log(JSON.stringify(building,null,2))

			var bounds = building['bldg:Building']['bldg:boundedBy']

			bounds = bounds
				.map(function (surface) {

					var Polygons = getOnlyProperty(surface)
						['bldg:lod2MultiSurface']
						['gml:MultiSurface']
						['gml:surfaceMember']


					if (Array.isArray(Polygons)) {
						return Polygons.map(function (polygon) {
							return getPosList(polygon, options.zeroPoint)
						})
					}
					else {
						// Polygons is just one polygon object
						return getPosList(Polygons, options.zeroPoint)
					}
				})

			console.log(bounds)//['bldg:RootSurface'])

			return {
				gmlid: building['bldg:Building']['gml:id'],
				terrainHeight: building['bldg:Building']
					['gen:doubleAttribute']['gen:value'],
				gltf: {
					accessors: {},
					asset: {},
					buffers: {},
					bufferViews: {},
					cameras: {
						camera1: {
							perspective: {
								aspect_ratio: 1.5,
								yfov: 37.8492,
								zfar: 100,
								znear: 0.01
							},
							type: 'perspective'
						}
					},
					images: {},
					lights: {
						directionalLight1: {
							directional: {
								color: [
									1,
									1,
									1
								]
							},
							type: "directional"
						}
					},
					materials: {
						material1: {
							instanceTechnique: {
								technique: "technique1",
								values: {
									ambient: [
										0,
										0,
										0,
										1
									],
									diffuse: "texture-file-1",
									emission: [
										0,
										0,
										0,
										1
									],
									shininess: 38.4,
									specular: [
										0,
										0,
										0,
										1
									]
								}
							},
							name: "Material 1"
						}
					},
					meshes: {
						buildingMesh: {
							name: "Building Mesh",
							primitives: [
								{
									attributes: {
										"NORMAL": "accessor-1",
										"POSITION": "accessor-2",
										"TEXCOORD_0": "accessor-3"
									},
									indices: "accessor-4",
									material: "material1",
									primitive: 4
								}
							]
						}
					},
					nodes: {
						building: {
							meshes: ['buildingMesh'],
							name: 'Building'
						},
						camera1: {
							camera: 'camera1',
							name: 'Camera 1'
						},
						directionalLight1: {
							light: 'directionalLight1',
							name: 'Directional Light 1'
						}
					},
					programs: {},
					samplers: {},
					scene: 'defaultScene',
					scenes: {
						defaultScene: {
							nodes: [
								'building',
								'camera1',
								'directionalLight1'
							]
						}
					},
					shaders: {},
					skins: {},
					techniques: {},
					textures: {}
				}
			}
		})
}


module.exports = function (options, callback) {

	var zeroCoords = [],
		zeroPoint,
		output,
		input

	if (Buffer.isBuffer(options))
		input = options
	else
		input = fs.readFileSync(options.inputFile)

	try {
		output = parser.toJson(input, {
			object: true
		})

		zeroCoords = output.CityModel['gml:boundedBy']['gml:Envelope']
			['gml:lowerCorner'].split(' ')

		zeroPoint = {
			x: zeroCoords[0],
			y: zeroCoords[1],
			z: zeroCoords[2]
		}

		output.CityModel.cityObjects = convert(
			output.CityModel.cityObjectMember,
			{zeroPoint: zeroPoint}
		)

		delete output.CityModel.cityObjectMember
	}
	catch (error) {
		return callback(error)
	}

	if (options.outputFile) {

		if (options.beautify)
			output = JSON.stringify(output, null, 4)
		else
			output = JSON.stringify(output)

		fs.writeFileSync(options.outputFile, output)
		callback()
	}
	else
		callback(null, output)
}
