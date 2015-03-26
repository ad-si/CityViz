var path = require('path'),
	express = require('express'),
	rdbWrapper = require('./src/rdbWrapper'),
	app = express(),
	port = 3000


app.use('/', express.static(path.resolve(__dirname, 'app')))

app.use('/modules', express.static(
		path.resolve(__dirname, 'node_modules'))
)

app.get('/buildings', function (request, response) {
	rdbWrapper
		.getAll()
		.then(function (buildings) {
			response.json(buildings)
		})
})

app.get('/buildings/:count', function (request, response) {
	rdbWrapper
		.get(request.params.count)
		.then(function (buildings) {
			response.json(buildings)
		})
})

app.get('/buildingsStream', function (request, response) {

	rdbWrapper
		.getStream()
		.pipe(response)
})

app.get('/buildingsEventStream', function (request, response) {

	response.set('Content-Type', 'text/event-stream')

	var stream = rdbWrapper.getStream()

	stream.on('data', function (chunk) {
		response.write('data:' + chunk + '\n\n')
	})

	stream.on('end', function (chunk) {
		response.end()
	})
})


app.listen(port, function () {
	console.log('Server listening at http://localhost:' + port)
})
