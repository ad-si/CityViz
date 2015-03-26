var rethinkdb = require('rethinkdbdash')(),
	rdbWrapper = {}


rdbWrapper.createTable = function () {
	return rethinkdb
		.db('cityviz')
		.tableCreate('buildings')
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
		.table('buildings')
		.insert(data)
		.run()
}

rdbWrapper.getAll = function () {

	return rethinkdb
		.db('cityviz')
		.table('buildings')
		.run()
}

rdbWrapper.getStream = function () {

	return rethinkdb
		.db('cityviz')
		.table('objects')
		.toStream()
		.on('error', console.error)
}

rdbWrapper.get = function (count) {

	return rethinkdb
		.db('cityviz')
		.table('buildings')
		.slice(0, Number(count))
		.run()
}


module.exports = rdbWrapper
