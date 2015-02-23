var fs = require('fs'),
	parser = require('xml2json')


function convert (buildings) {

	return buildings
		.map(function (building) {

			// return building

			return {
				id: building['bldg:Building']['gml:id'],
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

	var output,
		input

	if (Buffer.isBuffer(options))
		input = options
	else
		input = fs.readFileSync(options.inputFile)

	try {
		output = parser.toJson(input, {
			object: true
		})

		output.CityModel.cityObjects = convert(
			output.CityModel.cityObjectMember
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
