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

function retrieveURL(inputKey, successCallback, failureCallback) {
    if(exists) {
	var stmt = "SELECT url FROM URLs WHERE key = (?)";
	db.get(stmt, inputKey, function(err, answer) {
	    console.log(answer);
	    if (answer) {
		successCallback(answer.url);
		}
	    else {
		failureCallback();
		}
	});
    }
};

app.get("/:key", function(request, response) {
    retrieveURL(request.param("key"),
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
	console.log(urlString);
	insertUrl(key, urlString, function(err) {
	    if (err) {
		response.send("Failed to write to the database.");
	    }
	    else {
		response.send("http://fakeurl.com/"+ key);
	    }
	});
    }
});

function insertUrl(key, urlString, cb) {
    var query = client.query("INSERT INTO URLs (key, url) VALUES ($1, $2)", [key, urlString]);
    query.on('end', (function(result) {
	if (!result) { return; }
	cb(null);
    }));
    query.on('error', (function() { cb(true);}));
};

app.listen(3000, "0.0.0.0");
