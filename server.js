var express = require('express');
var app = express();
var fs = require('fs');
var url = require("url");
var dict = require("dict");
var file = "keymap.db";
var exists = fs.existsSync(file);

if(!exists) {
    console.log("Creating database file.");
    fs.openSync(file, "w")
}

var isurl = require("is-url");
var sqlite3 = require("sqlite3").verbose();
var db = new sqlite3.Database(file);
app.use(express.bodyParser());
app.use(app.router);

app.use('/', express.static('./public'));

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

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

function retrieveURL(inputKey) {
    if(exists) {
	var stmt = db.prepare("SELECT url FROM URLs WHERE key ="+ inputKey);


app.get("/:key", function(request, response) {
    var urlString = retrieveUrl(request.body.key);

    response.redirect(urlString);
});

// 404 response
app.use(function(err, request, response, next){
    console.error(err.stack);
    response.send(404, "Not valid");
});

// Shortens URL; returns placeholder page with values
app.post('/shortenURL', function(request, response) {
    var urlString = request.body.inputurl;
    if (isurl(urlString)) {
	var key = simpleHash(urlString);
	insertUrl(key, urlString);
	response.send("Adding " + key + urlString);
    }
    else (response.send("Invalid URL."))
});

function insertUrl(key, urlString) {
    db.serialize(function() {
	if(exists) {
	    db.run("CREATE TABLE URLs (key varchar(80), url varchar(500))");
	}
	var stmt = db.prepare("INSERT INTO URLs (key, url) VALUES (?, ?)");
	stmt.run(key, urlString);
	stmt.finalize();
//	db.close();
    });
};

app.listen(3000);
