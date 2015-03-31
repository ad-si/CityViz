'use strict'

var viewer = new Cesium.Viewer('cesiumContainer'),
	scene = viewer.scene,
	height = 0,
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
	queryString = '/cityObjectsStream/1000',
	firstCall = true


if (urlParameters.numberOfCityObjects)
	queryString = '/cityObjectsStream/' + urlParameters.numberOfCityObjects

if (urlParameters.allObjects)
	queryString = '/cityObjectsStream'


function getServerEvents() {

	var jsonStream = new EventSource('/cityObjectsEventStream')

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

function getCityObjectsStreamed() {
	var xhr = new XMLHttpRequest()

	xhr.open('GET', '/cityObjectsStream', true)
	xhr.addEventListener('progress', function () {
		console.log('PROGRESS: ' + xhr.responseText.length)
	})
	xhr.send()
}

function getCityObjects() {
	$.get(queryString, function (cityObjects) {

		console.log(cityObjects)

		cityObjects.forEach(function (building, index) {

			var addedBuilding,
				coordinates

			if (!building.groundSurfaceVertices)
				return

			coordinates = building.groundSurfaceVertices
				.map(function (vertex) {
					return Cesium.Cartesian3.fromDegrees.apply(null, vertex)
				})

			addedBuilding = viewer.entities.add({
				name: 'CityObject ' + index,
				description: 'GmlID: ' + building.gmlid + '<br>' +
				'Terrain-height: ' + building.terrainHeight + ' m<br>' +
				'District: ' + building.fileName + '<br>',
				polygon: {
					hierarchy: coordinates,
					material: Cesium.Color.RED.withAlpha(0.5),
					outline: true,
					outlineColor: Cesium.Color.BLACK
				}
			})

			if (index === cityObjects.length - 1)
				viewer.zoomTo(addedBuilding)
		})
	})
}

//getCityObjectsStreamed()
//getServerEvents()
getCityObjects()
