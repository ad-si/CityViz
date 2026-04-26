'use strict'

// Lightweight Cesium-style dev server: serves static files and proxies
// arbitrary URLs through /proxy/<url>. Uses Node's built-in fetch
// (Node 18+) so no third-party HTTP client is needed.

var express = require('express'),
	compression = require('compression'),
	path = require('path'),
	url = require('url'),

	yargs = require('yargs/yargs')(process.argv.slice(2))
		.options({
			port: {
				default: 8080,
				description: 'Port to listen on.'
			},
			public: {
				type: 'boolean',
				description: 'Run a public server that listens ' +
				'on all interfaces.'
			},
			'upstream-proxy': {
				description: 'A standard proxy server that will be used to' +
				' retrieve data. Specify a URL including port, ' +
				'e.g. "http://proxy:8000".'
			},
			'bypass-upstream-proxy-hosts': {
				description: 'A comma separated list of hosts that will ' +
				'bypass the specified upstream_proxy, ' +
				'e.g. "lanhost1,lanhost2"'
			},
			help: {
				alias: 'h',
				type: 'boolean',
				description: 'Show this help.'
			}
		}),
	argv = yargs.argv,
	bypassUpstreamProxyHosts,
	dontProxyHeaderRegex,
	upstreamProxy,
	server,
	app,
	projectServiceUrlParts,
	extraMimeTypes = {
		'.czml': 'application/json',
		'.geojson': 'application/json',
		'.topojson': 'application/json',
		'.gltf': 'application/json',
		'.glsl': 'text/plain'
	}

// featureInfo is stored locally because it's not yet available in the
// converted data
var featureInfo = [
	{ "gltfid": "54ee20fc0aeba2353a80330d", "levels": 6, "roof": "gray", "height": "17m", "coordinates": [4.4446946, 51.9125311] },
	{ "gltfid": "54ee20ce0aeba2353a803303", "levels": 6, "roof": "brown", "height": "15m", "coordinates": [4.4446946, 51.9115311] },
	{ "gltfid": "54ee20ee0aeba2353a80330a", "levels": 3, "roof": "brown", "height": "11m", "coordinates": [4.4442946, 51.9112311] },
	{ "gltfid": "54ee21080aeba2353a80330f", "levels": 4, "roof": "red", "height": "14m", "coordinates": [4.4416946, 51.9109311] },
	{ "gltfid": "54ee20db0aeba2353a803306", "levels": 5, "roof": "gray", "height": "15m", "coordinates": [4.4461946, 51.9104311] },
	{ "gltfid": "54ee20e90aeba2353a803309", "levels": 4, "roof": "gray", "height": "13m", "coordinates": [4.4466946, 51.9101311] },
	{ "gltfid": "54ee20f60aeba2353a80330c", "levels": 14, "height": "57m", "roof": "gray", "coordinates": [4.4496946, 51.9115311] },
	{ "gltfid": "54ee20f20aeba2353a80330b", "levels": 2, "height": "10m", "roof": "brown", "coordinates": [4.4492946, 51.9112311]}
]

if (argv.help) {
	yargs.showHelp()
	process.exit(0)
}


app = express()
app.use(compression())
app.use(express.static(__dirname, {
	setHeaders: function (res, filePath) {
		var ext = path.extname(filePath).toLowerCase(),
			type = extraMimeTypes[ext]
		if (type)
			res.setHeader('Content-Type', type)
	}
}))


function getRemoteUrlFromParam(req) {
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

dontProxyHeaderRegex = new RegExp(
	'^(?:Host|Proxy-Connection|Connection|Keep-Alive|' +
	'Transfer-Encoding|TE|Trailer|' +
	'Proxy-Authorization|Proxy-Authenticate|Upgrade)$',
	'i'
)

function filterHeaders(req, headers) {
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


function proxyRequest(remoteUrl, req, res) {

	var dispatcher

	if (upstreamProxy && !(remoteUrl.host in bypassUpstreamProxyHosts)) {
		var ProxyAgent = require('undici').ProxyAgent
		dispatcher = new ProxyAgent(upstreamProxy)
	}

	fetch(url.format(remoteUrl), {
		headers: filterHeaders(req, req.headers),
		dispatcher: dispatcher
	})
		.then(function (response) {
			res.status(response.status)
			response.headers.forEach(function (value, name) {
				if (!dontProxyHeaderRegex.test(name))
					res.setHeader(name, value)
			})
			return response.arrayBuffer()
		})
		.then(function (body) {
			res.send(Buffer.from(body))
		})
		.catch(function (error) {
			res.status(500).send(String(error))
		})
}


app.get('/proxy/*splat', function (req, res) {
	var remoteUrl

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
		return res.status(400).send('No url specified.')

	if (!remoteUrl.protocol)
		remoteUrl.protocol = 'http:'

	proxyRequest(remoteUrl, req, res)
})

/***
 * the getFeatureInfo route returns additional information for a building
 * @params: id - buildingID
 */

app.get('/db/getFeatureInfo', function (req, res) {
	var info = {}
	for (var i = 0; i < featureInfo.length; i++) {
		if (featureInfo[i]["gltfid"] == req.query.id) {
			info = featureInfo[i]
			break
		}
	}
	res.status(200).send(info)
})

/***
 * this route can be used to project coordinates via http://sampleserver1.arcgisonline.com
 * it is not used currently
 * @params: values - 2-dimensional array of float values
 */

app.get('/project/*splat', function (req, res) {
	var serviceUrl = url.parse(createServiceUrl(req.query.values))
	console.log(url.format(serviceUrl))
	proxyRequest(serviceUrl, req, res)
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

/**** Project coordinates from 28992 to 4326

 http://sampleserver1.arcgisonline.com/ArcGIS/rest/services/Geometry/
 GeometryServer/project?inSR=28992&
 outSR=4326&geometries=%7B%0D%0A%22geometryType
 %22%3A%22esriGeometryPoint%22%2C%0D%0A%22geometries%22%3A%5B%7B%22x%22%
 3A86693.42%2C+%22y%22%3A+441900.78%7D%5D%0D%0A%7D&f=JSON

 ****/

projectServiceUrlParts = [
	'http://sampleserver1.arcgisonline.com/ArcGIS/rest/services/Geometry/' +
	'GeometryServer/project?',
	'inSR=28992',
	'&outSR=4326',
	'&geometries={',
	'"geometryType":"esriGeometryPoint",',
	'"geometries":'
]

//expect array like [ [1.1, 2.1], [2.1, 1.1] ]
function createServiceUrl(array) {
	var geometries = [],
		serviceUrl

	array.forEach(function (point) {
		geometries.push({
			x: point[0],
			y: point[1]
		})
	})

	serviceUrl = projectServiceUrlParts.join('') +
	JSON.stringify(geometries) +
	'}&f=pjson'

	return serviceUrl
}
