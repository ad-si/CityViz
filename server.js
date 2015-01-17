"use strict"

var express = require('express'),
	compression = require('compression'),
	url = require('url'),
	request = require('request'),

	yargs = require('yargs').options({
		'port': {
			'default': 8080,
			'description': 'Port to listen on.'
		},
		'public': {
			'type': 'boolean',
			'description': 'Run a public server that listens ' +
			               'on all interfaces.'
		},
		'upstream-proxy': {
			'description': 'A standard proxy server that will be used to' +
			               ' retrieve data. Specify a URL including port, ' +
			               'e.g. "http://proxy:8000".'
		},
		'bypass-upstream-proxy-hosts': {
			'description': 'A comma separated list of hosts that will ' +
			               'bypass the specified upstream_proxy, ' +
			               'e.g. "lanhost1,lanhost2"'
		},
		'help': {
			'alias': 'h',
			'type': 'boolean',
			'description': 'Show this help.'
		}
	}),
	argv = yargs.argv,
	bypassUpstreamProxyHosts,
	dontProxyHeaderRegex,
	upstreamProxy,
	server,
	mime,
	app


if (argv.help)
	return yargs.showHelp()


// Eventually this mime type configuration will need to change
// https://github.com/tj/send/commit/d2cb546
mime = express.static.mime
mime.define({
	'application/json': ['czml', 'json', 'geojson', 'topojson', 'gltf'],
	'text/plain': ['glsl']
})

app = express()
app.use(compression())
app.use(express.static(__dirname))


function getRemoteUrlFromParam (req) {
	var remoteUrl = req.params[0]
	if (remoteUrl) {
		// add http:// to the URL if no protocol is present
		if (!/^https?:\/\//.test(remoteUrl))
			remoteUrl = 'http://' + remoteUrl

		remoteUrl = url.parse(remoteUrl)
		// copy query string
		remoteUrl.search = url.parse(req.url).search
	}
	return remoteUrl
}

dontProxyHeaderRegex = /^(?:Host|Proxy-Connection|Connection|Keep-Alive|Transfer-Encoding|TE|Trailer|Proxy-Authorization|Proxy-Authenticate|Upgrade)$/i;

function filterHeaders (req, headers) {
	var result = {}
	// filter out headers that are listed in the regex above
	Object
		.keys(headers)
		.forEach(function (name) {
			if (!dontProxyHeaderRegex.test(name)) {
				result[name] = headers[name]
			}
		})
	return result
}

upstreamProxy = argv['upstream-proxy']
bypassUpstreamProxyHosts = {}

if (argv['bypass-upstream-proxy-hosts']) {
	argv['bypass-upstream-proxy-hosts']
		.split(',')
		.forEach(function (host) {
			bypassUpstreamProxyHosts[host.toLowerCase()] = true
		})
}

app.get('/proxy/*', function (req, res, next) {
	var remoteUrl,
		proxy

	// look for request like
	// localhost:8080/proxy/http://example.com/file?query=1
	remoteUrl = getRemoteUrlFromParam(req)

	if (!remoteUrl) {
		// look for request like
		// localhost:8080/proxy/?http%3A%2F%2Fexample.com%2Ffile%3Fquery%3D1
		remoteUrl = Object.keys(req.query)[0]

		if (remoteUrl)
			remoteUrl = url.parse(remoteUrl)
	}

	if (!remoteUrl)
		return res.send(400, 'No url specified.')

	if (!remoteUrl.protocol)
		remoteUrl.protocol = 'http:'

	if (upstreamProxy && !(remoteUrl.host in bypassUpstreamProxyHosts))
		proxy = upstreamProxy


	// encoding : null means "body" passed to the callback will be raw bytes
	request.get(
		{
			url: url.format(remoteUrl),
			headers: filterHeaders(req, req.headers),
			encoding: null,
			proxy: proxy
		},
		function (error, response, body) {
			var code = 500

			if (response) {
				code = response.statusCode
				res.header(filterHeaders(req, response.headers))
			}

			res.send(code, body)
		}
	)
})

server = app.listen(
	argv.port, argv.public ? undefined : 'localhost',
	function () {
		if (argv.public) {
			console.log(
				'Cesium development server running publicly. ' +
				' Connect to http://localhost:%d/',
				server.address().port
			)
		}
		else {
			console.log(
				'Cesium development server running locally. ' +
				'Connect to http://localhost:%d/',
				server.address().port
			)
		}
	})

server.on('error', function (e) {
	if (e.code === 'EADDRINUSE') {
		console.log('Error: Port %d is already in use, ' +
		            'select a different port.', argv.port)
		console.log('Example: node server.js --port %d', argv.port + 1)
	}
	else if (e.code === 'EACCES') {
		console.log('Error: This process does not have permission to ' +
		            'listen on port %d.', argv.port)
		if (argv.port < 1024)
			console.log('Try a port number higher than 1024.')
	}

	console.log(e)
	process.exit(1)
})

server.on('close', function () {
	console.log('Cesium development server stopped.')
})

process.on('SIGINT', function () {
	server.close(function () {
		process.exit(0)
	})
})
