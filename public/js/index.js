/**
 * Created by Stephan on 25.01.2015.
 */

var viewer = new Cesium.Viewer('cesiumContainer'),
    scene = viewer.scene,
    canvas = viewer.canvas,
    camera


var height = 0.0,
    heading = 0.0,
    pitch = Cesium.Math.toRadians(180.0),
    roll = Cesium.Math.toRadians(0.0),

	/***
	 * du to issues with the conversion pipeline, the coordinates are currently not saved
	 * in the database and are therefore save locally
	 * @type {*[]}
	 */
    coordinates = [
		[4.440463, 51.5533],
		[4.440462, 51.5534],
		[4.4446946, 51.9115311],
		[4.4466946, 51.9110311], //Die Garage
		[4.4446946, 51.9110311], //scheinbar leer...
		[4.4461946, 51.9104311], //plattenbau
        [4.4466931, 51.9108826], //das kleine
        [5.4463576, 51.9110962], //das hässliche
		[4.4466946, 51.9101311], //altbau-grau-braun-dach
		[4.4442946, 51.9112311], //fabrik
		[4.4492946, 51.9112311], //reinhaus
		[4.4496946, 51.9115311], //BüroKomplex
		[4.4446946, 51.9125311], //6-Stock-Wohnhaus-Schön
		[4.4446946, 51.9105311], //Bungalow-Stück
		[4.4416946, 51.9109311], //Rot-Dach 4-Stock
		[4.4446946, 51.9115311],
        [4.4404615, 51.5534],
        [4.44046615, 51.555]
    ],
    rotterdamLat = 51.924420,
    rotterdamLong = 4.477733

	origin = Cesium.Cartesian3.fromDegrees(4.3004619, 51.5503706, height),
	rotateMatrix = Cesium.Matrix3.fromRotationX(Cesium.Math.toRadians(180.0))

function setCamera() {
	scene.camera.position = new Cesium.Cartesian3(3931516.3408164782, 305660.7236967403, 4996835.862537176)
	scene.camera.direction = new Cesium.Cartesian3(-0.9717706284258928, -0.08710696716161866, -0.21925834533865954)
	scene.camera.up = new Cesium.Cartesian3(-0.2162874162949232, 0.04231087627717153, 0.9754124990483365)
}
setCamera()

var labels

/***
 * this function requests the scene data from the database and renders the models
 */
$.get("/db/getScene", function(data) {
	var models,
		modelMatrix,
		i

	models = []

	for (i = 0; i < data.result.length; i++) {
		if (i != 1 && i < coordinates.length) {
			modelMatrix = Cesium.Transforms.eastNorthUpToFixedFrame(
				Cesium.Cartesian3.fromDegrees(
					coordinates[i][0],
					coordinates[i][1],
					height
				)
			)
			//Cesium.Transforms.eastNorthUpToFixedFrame(origin),

			Cesium.Matrix4.multiplyByMatrix3(
				modelMatrix,
				rotateMatrix,
				modelMatrix
			)

			models.push(scene.primitives.add(new Cesium.Model({
				gltf: data.result[i],//.gltf,
				modelMatrix: modelMatrix
				//scale: 2000
				//minimumPixelSize: 64
			})))
		}
	}



	models[0].readyPromise.then(function (model) {
		// Play and loop all animations at half-speed
		var pitch,
			camera,
			controller,
			r,
			center,
			heading

		model.activeAnimations.addAll({
			speedup: 0.5,
			loop: Cesium.ModelAnimationLoop.REPEAT
		})

		camera = viewer.camera

		// Zoom to model
		controller = scene.screenSpaceCameraController
		r = 2.0 * Math.max(model.boundingSphere.radius, camera.frustum.near)
		controller.minimumZoomDistance = r * 0.5

		center = Cesium.Matrix4.multiplyByPoint(
			model.modelMatrix,
			model.boundingSphere.center,
			new Cesium.Cartesian3()
		)
		heading = Cesium.Math.toRadians(230.0)
		pitch = Cesium.Math.toRadians(-20.0)
		camera.lookAt(
			center,
			new Cesium.HeadingPitchRange(heading, pitch, r * 2.0)
		)
	}).otherwise(function (error) {
		window.alert(error)
	})

})

/***
 * this function can be used to calculate the coordinates for tile loading
 * @param
 * @returns the coordinates or null in case of an error
 */

function calculateCoordinatesForTiles(){
    var coordinates = {},
		c2 = new Cesium.Cartesian2(0, 0)
    	leftTop = scene.camera.pickEllipsoid(c2)
    c2 = new Cesium.Cartesian2(canvas.width, canvas.height)
    var rightDown = scene.camera.pickEllipsoid(c2)

    if (leftTop != null && rightDown != null) {
        coordinates.leftTop = Cesium.Ellipsoid.WGS84.cartesianToCartographic(leftTop)
        coordinates.rightDown = Cesium.Ellipsoid.WGS84.cartesianToCartographic(rightDown)
        console.log("min lat/long - ", coordinates.leftTop.latitude, coordinates.leftTop.longitude)
        console.log("max lat/long - ", coordinates.rightDown.latitude, coordinates.rightDown.longitude)

		return coordinates
    } else {
        //The sky is visible in 3D
        return null
    }
}

/***
 * this handler handle hover events on buildings
 * it loads the additional information from the server
 * and displays it as a popup next to the building
 * @type {Cesium.ScreenSpaceEventHandler}
 */

var handler = new Cesium.ScreenSpaceEventHandler(canvas),
    lastModelId
handler.setInputAction(
    function (movement) {
        var pick = scene.pick(movement.endPosition)
        if (Cesium.defined(pick) && Cesium.defined(pick.node) && Cesium.defined(pick.mesh) &&
            lastModelId != pick.primitive._gltf._id) {
            console.log('gltfid: ' + pick.primitive._gltf._id + '  --  node.name: ' + pick.node.name + '. mesh: ' + pick.mesh.name)
            lastModelId = pick.primitive._gltf._id
            $.get("/db/getFeatureInfo", {id: lastModelId}, function(data){
				scene.primitives.remove(labels)
				labels = new Cesium.LabelCollection()
				labels.add({
					position:  Cesium.Cartesian3.fromDegrees(data.coordinates[0]+0.0004, data.coordinates[1], 5.1),
					text: "Levels: " + data.levels +
						", Height: " + data.height,
					fillColor : Cesium.Color.WHITE,
					outlineColor : Cesium.Color.BLACK,
					style : Cesium.LabelStyle.FILL_AND_OUTLINE,
					font : '26px sans-serif'
				})

				scene.primitives.add(labels)
            })
        }
    },
    Cesium.ScreenSpaceEventType.MOUSE_MOVE
)
