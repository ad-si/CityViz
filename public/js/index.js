/**
 * Created by Stephan on 25.02.2015.
 */

var viewer = new Cesium.Viewer('cesiumContainer'),
    scene = viewer.scene,
    canvas = viewer.canvas,
    camera

var height = 0.0,
    heading = 0.0,
    pitch = Cesium.Math.toRadians(180.0),
    roll = Cesium.Math.toRadians(0.0),
    coordinates = [
        [4.300466, 51.5533],
        [4.300465, 51.5531],
        [4.300464, 51.5532],
        [4.300463, 51.5533],
        [4.300462, 51.5534],
        [4.300461, 51.5535],
        [4.300460, 51.55336],
        [4.3004687, 51.5507],
        [4.3004698, 51.558],
        [4.3004679, 51.5533],
        [4.3004610, 51.5538],
        [4.3004691, 51.5539],
        [4.3004614, 51.5530],
        [4.3004615, 51.5535],
        [4.3004615, 51.5531],
        [4.3004615, 51.55331],
        [4.3004615, 51.5534],
        [4.30046615, 51.555]
    ],
    rotterdamLat = 51.924420,
    rotterdamLong = 4.477733

	origin = Cesium.Cartesian3.fromDegrees(4.3004619, 51.5503706, height),
	rotateMatrix = Cesium.Matrix3.fromRotationX(Cesium.Math.toRadians(180.0))
//Cesium.Transforms.headingPitchRollToFixedFrame(origin, heading, pitch, roll)

//scene.camera = new Cesium.Camera(scene)
scene.camera.position = new Cesium.Cartesian3(4043672.0635229214, 306571.6542225573, 4989015.102828192)
//new Cesium.Cartographic(rotterdamLat, rotterdamLong, 1000)
scene.camera.direction = new Cesium.Cartesian3(-0.9717706284258928, -0.08710696716161866, -0.21925834533865954)
scene.camera.up = new Cesium.Cartesian3(-0.2162874162949232, 0.04231087627717153, 0.9754124990483365)

$.get("/db/buildings", function(data){
    var models,
        modelMatrix,
        i

	console.log(data)
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
				modelMatrix: modelMatrix,
				//scale: 2000
				minimumPixelSize: 64
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

$("html").keydown(function(event){
    var c2 = new Cesium.Cartesian2(0, 0)
    var leftTop = scene.camera.pickEllipsoid(c2)
    c2 = new Cesium.Cartesian2(canvas.width, canvas.height)
    var rightDown = scene.camera.pickEllipsoid(c2)

    if (leftTop != null && rightDown != null) { //ignore jslint
        leftTop = Cesium.Ellipsoid.WGS84.cartesianToCartographic(leftTop)
        rightDown = Cesium.Ellipsoid.WGS84.cartesianToCartographic(rightDown)
        console.log("min lat/long - ", leftTop.latitude, leftTop.longitude)
        console.log("max lat/long - ", rightDown.latitude, rightDown.longitude)
    } else {
        //The sky is visible in 3D
        return null
    }
})

var handler = new Cesium.ScreenSpaceEventHandler(canvas),
    lastModelId
handler.setInputAction(
    function (movement) {
        var pick = scene.pick(movement.endPosition)
        if (Cesium.defined(pick) && Cesium.defined(pick.node) && Cesium.defined(pick.mesh) &&
            lastModelId != pick.primitive._gltf._id) {
            console.log('gltfid: ' + pick.primitive._gltf._id + '  --  node.name: ' + pick.node.name + '. mesh: ' + pick.mesh.name)
            lastModelId = pick.primitive._gltf._id
            $.get("/db/info", {id: lastModelId}, function(data){
                console.log(data)
            })
        }
    },
    Cesium.ScreenSpaceEventType.MOUSE_MOVE
)
