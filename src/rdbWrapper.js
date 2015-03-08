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
		.then(function (response) {
			// console.log(response)
		})
}

rdbWrapper.getAll = function(){

	return rethinkdb
		.db('cityviz')
		.table('buildings')
		.run()
}


module.exports = rdbWrapper
