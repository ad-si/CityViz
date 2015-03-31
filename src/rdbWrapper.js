var rethinkdb = require('rethinkdbdash')(),
	JSONStream = require('JSONStream'),
	rdbWrapper = {}


rdbWrapper.createTable = function () {
	return rethinkdb
		.db('cityviz')
		.tableCreate('cityObjects')
		.run()
		.catch(function (error) {
			console.error(error.message)
		})
		.then(function (response) {
			console.log(response)
		})
}


rdbWrapper.insert = function (data) {

	return rethinkdb
		.db('cityviz')
		.table('cityObjects')
		.insert(data)
		.run()
}

rdbWrapper.getStream = function (options) {

	var requestChain = rethinkdb
		.db('cityviz')
		.table('cityObjects')

	if (options.numberOfCityObjects)
		requestChain = requestChain
			.slice(0, Number(options.numberOfCityObjects))

	return requestChain
		.toStream()
		.pipe(JSONStream.stringify())
}

rdbWrapper.get = function (options) {

	var requestChain = rethinkdb
		.db('cityviz')
		.table('cityObjects')


	if (options.numberOfCityObjects)
		requestChain = requestChain
			.slice(0, Number(options.numberOfCityObjects))

	return requestChain.run()
}


module.exports = rdbWrapper
