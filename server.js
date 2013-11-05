var express = require('express');
var app = express();
fs = require('fs');
var dict = require("dict");
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
    if ("abcdefghijklmnopqrstuvwxyz".indexOf(character) !== -1) 
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
    response.redirect(map.get(request.param('key')));
});

app.use(function(err, request, response, next){
    console.error(err.stack);
    response.send(404, "Not valid");
});

// Shortens URL; returns placeholder page with values
app.post('/shortenURL', function(request, response) {
    var url = request.body.inputurl;
    console.log(url);
    var key = simpleHash(url);
    console.log(key);
    while (map.has(key)) {
	key = key + getRandomInt(0, 10);
    }
    map.set(key, url);
    console.log(map);
    response.send("Adding " + key + url);
});

app.listen(3000);
