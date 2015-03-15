/**
 * Created by Stephan on 25.02.2015.
 */

var viewer = new Cesium.Viewer('cesiumContainer'),
    scene = viewer.scene

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
    ]

var origin = Cesium.Cartesian3.fromDegrees(4.3004619, 51.5503706, height),
    rotateMatrix = Cesium.Matrix3.fromRotationX(Cesium.Math.toRadians(180.0))
        //Cesium.Transforms.headingPitchRollToFixedFrame(origin, heading, pitch, roll)


$.get("/db/hi", function(data){
    console.log(data)
    var models = []
    for(var i=0; i<data.result.length; i++){
        if(i!=1 && i < coordinates.length) {
            var modelMatrix = Cesium.Transforms.eastNorthUpToFixedFrame(
                    Cesium.Cartesian3.fromDegrees(coordinates[i][0], coordinates[i][1], height))//Cesium.Transforms.eastNorthUpToFixedFrame(origin),

            Cesium.Matrix4.multiplyByMatrix3(modelMatrix, rotateMatrix, modelMatrix)

            models.push(scene.primitives.add(new Cesium.Model({
                gltf: data.result[i],//.gltf,
                modelMatrix: modelMatrix,
                //scale: 2000
                minimumPixelSize: 64
            })))
        }
    }

    models[0].readyPromise.then(function(model) {
        // Play and loop all animations at half-speed
        model.activeAnimations.addAll({
            speedup : 0.5,
            loop : Cesium.ModelAnimationLoop.REPEAT
        })

        var camera = viewer.camera

        // Zoom to model
        var controller = scene.screenSpaceCameraController
        var r = 2.0 * Math.max(model.boundingSphere.radius, camera.frustum.near)
        controller.minimumZoomDistance = r * 0.5

        var center = Cesium.Matrix4.multiplyByPoint(
	        model.modelMatrix,
	        model.boundingSphere.center,
	        new Cesium.Cartesian3()
        )
        var heading = Cesium.Math.toRadians(230.0)
        var pitch = Cesium.Math.toRadians(-20.0)
        camera.lookAt(center, new Cesium.HeadingPitchRange(heading, pitch, r * 2.0))
    }).otherwise(function(error){
        window.alert(error)
    })

})
