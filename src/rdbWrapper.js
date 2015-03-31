var rethinkdb = require('rethinkdbdash')(),
	JSONStream = require('JSONStream'),
	rdbWrapper = {},
	util = require('util')


rdbWrapper.createDatabase = function () {
	return rethinkdb
		.dbCreate('cityviz')
		.run()
		.catch(function (error) {
			if (error.message.search('already exists') === -1)
				throw error
		})
		.then(function (response) {
			if (response)
				console.log('Created cityviz database')
		})
}

rdbWrapper.createTable = function () {
	return rethinkdb
		.db('cityviz')
		.tableCreate('cityObjects')
		.run()
		.catch(function (error) {
			if (error.message.search('already exists') === -1)
				throw error
		})
		.then(function (response) {
			if (response)
				console.log('Created cityviz table')
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

	// The names of rottderdam citygml files
	// match the districts of the cityObjects
	// TODO: Generalize
	if (options.district)
		requestChain = requestChain
			.filter(rethinkdb
				.row("fileName")
				.eq(options.district))

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
