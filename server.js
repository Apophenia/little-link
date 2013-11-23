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

app.post("/test", function(request, response) {
var secret = request.body.secret;
response.send("Server says" + secret);
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

app.post('/AjaxTest', function(request, response) {
    response.send("Hello world!")
    }
);

function insertUrl(key, urlString, cb) {
    db.serialize(function() {
	if(exists) {
	    var stmt = db.prepare("INSERT INTO URLs (key, url) VALUES (?, ?)");
	    stmt.run(key, urlString);
	    stmt.finalize();
	    cb(null);
	}
	else {
	    cb(true);
	}
    });
};

app.listen(3000, "0.0.0.0");
