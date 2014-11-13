var express = require('express')
var app = express();
var url = require("url"),
    path = require("path"),
    pg = require('pg'),
    fs = require("fs");

app.set('port', (process.env.PORT || 5000))
app.use(express.static(__dirname + '/public'))

console.log("dbURL: ",process.env.DATABASE_URL);
app.get('/db', function (request, response) {
  pg.connect(process.env.DATABASE_URL, function(err, client, done) {
    client.query('SELECT * FROM test_table', function(err, result) {
      done();
      if (err)
       { console.error(err); response.send("Error " + err); }
      else
       { response.send(result.rows); }
    });
  });
})

app.get('/', function(request, response) {
  response.send('Hello World!')
  console.log("`/` hit")
})

app.get('/fileserver/*', function(request, response) {
    console.log("--= SERVER =--")
    console.log("`"+url.parse(request.url).pathname+"` hit")
    var uri = url.parse(request.url).pathname.replace("/fileserver","/content");
    var filename = path.join(process.cwd(), uri);
    fs.exists(filename, function(exists) {
        if(!exists || uri == "/content/") {
            console.log("returning 404 not found")
            response.writeHead(404, {"Content-Type": "text/plain"});
            response.end("404: cannot find file `"+uri+"` in fileserver.");
            return;
        }

        fs.readFile(filename, "binary", function(err, file) {
            if(err) {
                console.log("returning 500 err")
                response.writeHead(500, {"Content-Type": "text/plain"});
                response.end(err);
                return;
            }

            console.log("returning 200 ok")
            response.writeHead(200);
            response.end(file, "binary");
        });
    });
})

app.listen(app.get('port'), function() {
  console.log("Node app is running at port:" + app.get('port'))
})
