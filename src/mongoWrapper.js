var pmongo = require('promised-mongo'),
	mongoWrapper = {}


//not relevant, collections are created implicitly when data is inserted
mongoWrapper.createTable = function () {
	return pmongo('mongodb://localhost:27017/cityViz')
		.createCollection('buildings')
		.catch(function (error) {
			console.error(error.message)
		})
		.then(function (response) {
			console.log(response)
		})
}

mongoWrapper.insert = function (data) {
	return pmongo('mongodb://localhost:27017/cityViz')
		.buildings
		.insert(data)
}

mongoWrapper.getAll = function () {
	return pmongo('mongodb://localhost:27017/cityViz')
		.buildings
		.find()
		.toArray()
}

module.exports = mongoWrapper
