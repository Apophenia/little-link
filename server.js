var express = require('express');
var app = express();
fs = require('fs');
var dict = require("dict");
app.use(app.router);

var map = dict();

// mounts public prefix
// app.use('/public', express.static('public'));

app.use('/', express.static('./public'));

var lines = fs.readFileSync("database.txt", 'utf8').split('\n');
console.log(lines);

for (var i = 0; i < lines.length; i++) {
var tempArray = lines[i].split(" ");
map.set(tempArray[0],tempArray[1]);
}

app.get('/', function(request, response) {
   response.sendfile("public/index.html");
});

app.get("/:key", function(request, response) {
  response.redirect(map.get(request.param('key')));
});

app.listen(3000);
