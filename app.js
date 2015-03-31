var path = require('path'),
	express = require('express'),
	rdbWrapper = require('./src/rdbWrapper'),
	app = express(),
	port = 3000


app.use('/', express.static(path.resolve(__dirname, 'app')))

app.use('/modules', express.static(
		path.resolve(__dirname, 'node_modules'))
)

app.get('/cityObjects', function (request, response) {
	rdbWrapper
		.getAll()
		.then(function (cityObjects) {
			response.json(cityObjects)
		})
})

app.get('/cityObjects/:count', function (request, response) {
	rdbWrapper
		.get(request.params.count)
		.then(function (cityObjects) {
			response.json(cityObjects)
		})
})

app.get('/cityObjectsStream', function (request, response) {

	rdbWrapper
		.getStream()
		.pipe(response)
})

app.get('/cityObjectsEventStream', function (request, response) {

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
