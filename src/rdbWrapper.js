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

rdbWrapper.getAll = function () {

	return rethinkdb
		.db('cityviz')
		.table('cityObjects')
		.run()
}

rdbWrapper.getStream = function () {

	return rethinkdb
		.db('cityviz')
		.table('cityObjects')
		.toStream()
		.on('error', console.error)
		.pipe(JSONStream.stringify())
}

rdbWrapper.get = function (count) {

	return rethinkdb
		.db('cityviz')
		.table('cityObjects')
		.slice(0, Number(count))
		.run()
}


module.exports = rdbWrapper
