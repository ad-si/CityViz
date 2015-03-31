'use strict'

var path = require('path'),
	express = require('express'),
	rdbWrapper = require('./src/rdbWrapper'),
	app = express(),
	port = 3000


app.use('/', express.static(path.resolve(__dirname, 'app')))

app.use('/modules', express.static(
		path.resolve(__dirname, 'node_modules'))
)


function sendCityObjects(request, response) {

	if (request.query.type === 'buffered') {

		rdbWrapper
			.get({
				numberOfCityObjects: request.params.count
			})
			.then(function (cityObjects) {
				response.json(cityObjects)
			})
	}

	else if (request.query.type === 'event-stream') {

		response.set('Content-Type', 'text/event-stream')

		var stream = rdbWrapper.getStream({
			numberOfCityObjects: request.params.count
		})

		stream.on('data', function (chunk) {
			response.write('data:' + chunk + '\n\n')
		})

		stream.on('end', function (chunk) {
			response.end()
		})
	}

	else {

		response.set('Content-Type', 'application/json')

		rdbWrapper
			.getStream({
				numberOfCityObjects: request.params.count
			})
			.pipe(response)
	}
}


app.get('/cityObjects', sendCityObjects)
app.get('/cityObjects/:count', sendCityObjects)


app.listen(port, function () {
	console.log('Server listening at http://localhost:' + port)
})
