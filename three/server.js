var fs = require("fs"),
	path = require("path"),
	host = "127.0.0.1",
	port = 1337,
	express = require("express")


var app = express()

	
app.use(function(req, res, next){
  res.header('Access-Control-Allow-Origin', 'http://localhost:1337/')
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELET,OPTIONS')
 //res.header('Access-Control-Allow-Headers', 'Content-Type')
  next()
})

app.use(express.static('.')) //use static files in ROOT/public folder
//app.use(express.static(path.join(path, 'js')))



app.get("*", function(req, res, next){ //root dir

  next()
})

app.listen(port, host)


/*var host = "127.0.0.1"
var port = 1337
var express = require("express")

var app = express()
app.use('/', express.static('C:\\Users\\Stephan\\Documents\\Studium\\SemesterV\\3DCity\06-webgl-client\\three\\'))
app.listen(port, host)*/

console.log("Server is listening at: " + host + ":" + port) 
