'use strict'

var viewer = new Cesium.Viewer('cesiumContainer'),
	scene = viewer.scene,

	height = 0,
	heading = 0,
	pitch = Cesium.Math.toRadians(180),
	roll = Cesium.Math.toRadians(0),

	origin = Cesium.Cartesian3.fromDegrees(4.3004619, 51.5503706, height),
	modelMatrix = Cesium.Transforms.eastNorthUpToFixedFrame(origin),
	urlParameters = window
		.location
		.search
		.substring(1)
		.split('&')
		.reduce(function (previous, next) {
			var keyValue = next.split('=')
			previous[keyValue[0]] = keyValue[1]
			return previous
		}, {}),
	queryString = '/buildings/1000',
	firstCall = true

//Cesium.Transforms.headingPitchRollToFixedFrame(origin, heading, pitch, roll)


if (urlParameters.numberOfObjects)
	queryString = '/buildings/' + urlParameters.numberOfObjects

if (urlParameters.allObjects)
	queryString = '/buildings'


function getServerEvents() {

	var jsonStream = new EventSource('/buildingsEventStream')

	jsonStream.addEventListener('message', function (event) {

		var building = JSON.parse(event.data),
			addedBuilding,
			coordinates

		if (!building.groundSurfaceVertices)
			return

		coordinates = building.groundSurfaceVertices
			.map(function (vertex) {
				return Cesium.Cartesian3.fromDegrees.apply(null, vertex)
			})

		addedBuilding = viewer.entities.add({
			name: 'building ' + building.id,
			polygon: {
				hierarchy: coordinates,
				material: Cesium.Color.RED.withAlpha(0.5),
				outline: true,
				outlineColor: Cesium.Color.BLACK
			}
		})

		if (firstCall) {
			firstCall = false
			viewer.zoomTo(addedBuilding)
		}
	})

	jsonStream.addEventListener('open', function () {
		console.log('Connection was opened')
	})

	jsonStream.addEventListener('error', function (error) {
		console.error(error)
	})
}

function getCityObjects() {
	$.get(queryString, function (buildings) {

		console.log('Number of buildings:', buildings.length)

		buildings.forEach(function (building, index) {

			var addedBuilding,
				coordinates

			if (!building.groundSurfaceVertices)
				return

			coordinates = building.groundSurfaceVertices
				.map(function (vertex) {
					return Cesium.Cartesian3.fromDegrees.apply(null, vertex)
				})

			addedBuilding = viewer.entities.add({
				name: 'building ' + index,
				polygon: {
					hierarchy: coordinates,
					material: Cesium.Color.RED.withAlpha(0.5),
					outline: true,
					outlineColor: Cesium.Color.BLACK
				}
			})

			if (index === buildings.length - 1)
				viewer.zoomTo(addedBuilding)

			//models.push(scene.primitives.add(new Cesium.Model({
			//	gltf: buildings[index],
			//	modelMatrix: Cesium.Transforms.eastNorthUpToFixedFrame(
			//		Cesium.Cartesian3.fromDegrees(
			//			4.3004619 + index * 0.001,
			//			51.5503706,
			//			height)
			//	),
			//	//scale: 2000
			//	minimumPixelSize: 128
			//})))

		})


		//models[0]
		//	//.readyPromise
		//	.then(function (model) {
		//
		//		var pitch,
		//			heading,
		//			center,
		//			r,
		//			controller,
		//			camera
		//
		//		// Play and loop all animations at half-speed
		//		model.activeAnimations.addAll({
		//			speedup: 0.5,
		//			loop: Cesium.ModelAnimationLoop.REPEAT
		//		})
		//
		//		camera = viewer.camera;
		//
		//		// Zoom to model
		//		controller = scene.screenSpaceCameraController;
		//		r = 2.0 * Math.max(model.boundingSphere.radius, camera.frustum.near);
		//		controller.minimumZoomDistance = r * 0.5
		//
		//		center = Cesium.Matrix4.multiplyByPoint(
		//			model.modelMatrix,
		//			model.boundingSphere.center,
		//			new Cesium.Cartesian3()
		//		)
		//		heading = Cesium.Math.toRadians(230.0)
		//		pitch = Cesium.Math.toRadians(-20.0)
		//		camera.lookAt(
		//			center,
		//			new Cesium.HeadingPitchRange(heading, pitch, r * 2.0)
		//		)
		//	})
		//	.otherwise(function (error) {
		//		alert(error)
		//	})
	})
}

function getCityObjectsStreamed() {
	var xhr = new XMLHttpRequest()

	xhr.open('GET', '/buildingsStream', true)
	xhr.addEventListener('progress', function () {
		console.log('PROGRESS: ' + xhr.responseText.length)
	})
	xhr.send()
}

getCityObjects()
//getCityObjectsStreamed()
//getServerEvents()
