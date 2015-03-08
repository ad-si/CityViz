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


app.listen(port, function () {
	console.log('Server listening at http://localhost:' + port)
})
