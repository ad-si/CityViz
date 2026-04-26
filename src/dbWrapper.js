'use strict'

// SQLite-backed JSON document store. cityObjects are stored as JSON
// blobs; SQLite's json_extract handles the only filter we need
// (by fileName).

var path = require('path'),
	Readable = require('stream').Readable,
	sqlite = require('better-sqlite3'),
	JSONStream = require('JSONStream'),

	dbPath = path.join(__dirname, '..', 'cityviz.sqlite'),
	db = sqlite(dbPath),
	dbWrapper = {}


db.exec(
	'CREATE TABLE IF NOT EXISTS cityObjects (' +
	'id INTEGER PRIMARY KEY AUTOINCREMENT,' +
	'data TEXT NOT NULL' +
	')'
)
db.exec(
	'CREATE INDEX IF NOT EXISTS idx_cityObjects_fileName ' +
	"ON cityObjects (json_extract(data, '$.fileName'))"
)


function buildSelect(options) {

	var sql = 'SELECT data FROM cityObjects',
		params = []

	if (options.district) {
		sql += " WHERE json_extract(data, '$.fileName') = ?"
		params.push(options.district)
	}

	if (options.numberOfCityObjects) {
		sql += ' LIMIT ?'
		params.push(Number(options.numberOfCityObjects))
	}

	return {sql: sql, params: params}
}


function rowsToObjectStream(stmt, params) {

	var iterator = stmt.iterate.apply(stmt, params),
		readable = new Readable({objectMode: true})

	readable._read = function () {
		var next = iterator.next()
		if (next.done)
			this.push(null)
		else
			this.push(JSON.parse(next.value.data))
	}

	return readable
}


dbWrapper.insert = function (cityObjects) {

	return new Promise(function (resolve, reject) {

		try {
			var stmt = db.prepare('INSERT INTO cityObjects (data) VALUES (?)'),
				insertMany = db.transaction(function (objects) {
					for (var i = 0; i < objects.length; i++)
						stmt.run(JSON.stringify(objects[i]))
				})

			insertMany(cityObjects)
			resolve()
		}
		catch (error) {
			reject(error)
		}
	})
}


dbWrapper.get = function (options) {

	return new Promise(function (resolve, reject) {

		try {
			var query = buildSelect(options),
				stmt = db.prepare(query.sql),
				rows = stmt.all.apply(stmt, query.params)

			resolve(rows.map(function (row) {
				return JSON.parse(row.data)
			}))
		}
		catch (error) {
			reject(error)
		}
	})
}


dbWrapper.getStream = function (options) {

	var query = buildSelect(options),
		stmt = db.prepare(query.sql)

	return rowsToObjectStream(stmt, query.params)
		.pipe(JSONStream.stringify())
}


module.exports = dbWrapper
