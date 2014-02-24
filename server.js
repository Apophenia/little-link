var express = require('express');
var app = express();
var url = require("url");
var dict = require("dict");
var isurl = require("is-url");
var pg = require('pg');

app.configure(function(){
    app.use(express.logger('dev'));
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(express.static('public'));
    app.use(app.router);
});

var client = new pg.Client(process.env.DATABASE_URL);

client.connect(function(err) {
    if(err) {
	return console.error('Failed to connect to Postgres', err);
    }
});

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

function keyExists(inputKey) {
    console.log(inputKey);
    var query = client.query("SELECT * FROM URLs WHERE key = ($1)", [inputKey]);
    var addr = "";
    query.on('row', (function(row) {
	addr = row;
    }));
    return addr;
}

function retrieveUrl(inputKey, successCallback, failureCallback) {
    var query = client.query("SELECT url FROM URLs WHERE key = ($1)", [inputKey]);
    query.on('row', (function(row) {
	if (!row) { return; }
	successCallback(row.url);
    }));
    query.on('error', failureCallback);
}

app.get("/:key", function(request, response) {
    retrieveUrl(request.param("key"),
		function (url) {
		    response.redirect(url);
		}, // success callback
		function(err) {
		    response.send(404, "404: Page not found.");
		    console.log(err);
		}); // failure callback
});

// 404 response
app.use(function(err, request, response, next){
    console.error(err.stack);
    response.send(404, "404: Page not found");
});

// Shortens URL; returns placeholder page with values
app.post('/shortenURL', function(request, response) {
    var urlString = prefixUrl(request.body.inputurl);
    var validURL = (isurl(urlString));
    if (!validURL) {
	response.send("Invalid URL.");
    }
    else {
	var key = simpleHash(urlString);
	keyExists(key);
	insertUrl(key, urlString, function(err) {
	    var message = "";
	    if (err) {
		message = "Failed to write to the database.";
	    }
	    else {
		message = "http://fakeurl.com/"+ key;
	    }
	    response.send(message);
	});
    }
});

function writePair(key, urlString, cb) {
    var query = client.query("INSERT INTO URLs (key, url) VALUES ($1, $2)", [key, urlString]);
    query.on('end', function(result) { cb(); });
    query.on('error', cb);
};

function insertUrl(key, urlString, cb) {
    if (!keyExists(key)) {
	writePair(key, urlString, function(err) {
	    if (err) {
		console.log("error");
		cb(err);
	    }
	    else {
		console.log("no error");
		cb();
	    }
	});
    }
}

app.listen(3000, "0.0.0.0");
