var express = require('express');
var app = express();
var fs = require('fs');
var url = require("url");
var dict = require("dict");
var file = "keymap.db";
var exists = fs.existsSync(database);
var isurl = require("is-url");
var sqlite3 = require("sqlite3").verbose();
var db = new sqlite3.Database(file);
app.use(express.bodyParser());
app.use(app.router);

app.use('/', express.static('./public'));

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

// This seems... inefficient.
function validate(character) {
    if (/[a-z]/.test(character))
    	return character;
    else
	return "" + getRandomInt(0, 9);
}

function prefixUrl(urlString) {
var urlProtocol = url.parse(urlString).protocol;
    console.log(urlProtocol);
    // add protocol prefix if one does not exist
    if (urlProtocol == null) {
	urlString = "http://" + urlString;
	}
    return urlString;
};

// Placeholder hash function that returns a reduced key string, given a url
function simpleHash(url) {
    while (url.length < 10) {
	url = url.repeat(2);
    }
    return (validate(url.charAt(getRandomInt(3, 10))) +
	    validate(url.charAt(getRandomInt(3,10))) +
	    getRandomInt(0, 300));
}

// Basic HTTP response functions
app.get('/', function(request, response) {
   response.sendfile("public/index.html");
});

app.get("/:key", function(request, response) {
    var urlString = 
    response.redirect(urlString);
});

app.use(function(err, request, response, next){
    console.error(err.stack);
    response.send(404, "Not valid");
});

// Shortens URL; returns placeholder page with values
app.post('/shortenURL', function(request, response) {    
    var urlString = request.body.inputurl;

/* Begin DB calls

db.serialize(function() {
    if(!exists) {
	db.run("CREATE TABLE URLs (key varchar(80), url(500)");
}

var stmt = db.prepare("INSERT INTO URLs VALUES (?, ?)");

*/

    if (isurl(urlString)) {
	var key = simpleHash(urlString);
	while (map.has(key)) {
	    key = key + getRandomInt(0, 10);
	}
	map.set(key, urlString);
	response.send("Adding " + key + urlString);
    }
    else (response.send("That's not a real URL, silly!"));
});

app.listen(3000);
