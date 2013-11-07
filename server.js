var express = require('express');
var app = express();
var fs = require('fs');
var url = require("url");
var dict = require("dict");
var isurl = require("is-url")
app.use(express.bodyParser());
app.use(app.router);

var map = dict();

app.use('/', express.static('./public'));

var lines = fs.readFileSync("database.txt", 'utf8').split('\n');

// Loads "database" ;) into map in memory
for (var i = 0; i < lines.length; i++) {
var tempArray = lines[i].split(" ");
map.set(tempArray[0],tempArray[1]);
}

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
    var urlString = map.get(request.param('key'));
    console.log(urlString);
    var urlProtocol = url.parse(urlString).protocol;
    console.log(urlProtocol);
    // add protocol prefix if one does not exist
    if (urlProtocol == null) {
	urlString = "http://" + urlString;
	}
    response.redirect(urlString);
});

app.use(function(err, request, response, next){
    console.error(err.stack);
    response.send(404, "Not valid");
});

// Shortens URL; returns placeholder page with values
app.post('/shortenURL', function(request, response) {    
    var urlString = request.body.inputurl;
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
