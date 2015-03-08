/**
 * Created by Stephan on 25.02.2015.
 */

var viewer = new Cesium.Viewer('cesiumContainer'),
    scene = viewer.scene

var height = 0.0,
    heading = 0.0,
    pitch = Cesium.Math.toRadians(180.0),
    roll = Cesium.Math.toRadians(0.0)

var origin = Cesium.Cartesian3.fromDegrees(4.3004619, 51.5503706, height),
    modelMatrix = Cesium.Transforms.eastNorthUpToFixedFrame(origin)
        //Cesium.Transforms.headingPitchRollToFixedFrame(origin, heading, pitch, roll)


$.get("/db/hi", function(data){
    console.log(data)
    var models = []
    for(var i=0; i<data.result.length; i++){
        if(i!=1)
          models.push(scene.primitives.add(new Cesium.Model({
                gltf: data.result[i],
                modelMatrix: Cesium.Transforms.eastNorthUpToFixedFrame(
                    Cesium.Cartesian3.fromDegrees(4.3004619 + i*0.001, 51.5503706, height)),
                //scale: 2000
                minimumPixelSize: 128
          })))
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

