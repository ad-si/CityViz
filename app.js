'use strict'

var path = require('path'),
	express = require('express'),
	serveFavicon = require('serve-favicon'),
	rdbWrapper = require('./src/rdbWrapper'),
	app = express(),
	port = 3000


app.use(serveFavicon(path.join(__dirname, 'app/img/favicon.png')))

app.use('/', express.static(path.resolve(__dirname, 'app')))

app.use('/modules', express.static(
		path.resolve(__dirname, 'node_modules'))
)


function sendCityObjects(request, response) {

	var options = {
		numberOfCityObjects: request.params.count,
		district: request.query.district
	}


	if (request.query.type === 'buffered') {

		rdbWrapper
			.get(options)
			.then(function (cityObjects) {
				response.json(cityObjects)
			})
	}

	else if (request.query.type === 'event-stream') {

		var stream

		response.set('Content-Type', 'text/event-stream')

		stream = rdbWrapper.getStream(options)

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
			.getStream(options)
			.pipe(response)
	}
}


app.get('/cityObjects', sendCityObjects)
app.get('/cityObjects/:count', sendCityObjects)


app.listen(port, function () {
	console.log('Server listening at http://localhost:' + port)
})
