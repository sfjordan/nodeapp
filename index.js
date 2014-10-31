var express = require('express')
var app = express();
var url = require("url"),
    path = require("path"),
    fs = require("fs");

app.set('port', (process.env.PORT || 5000))
app.use(express.static(__dirname + '/public'))

app.get('/', function(request, response) {
  response.send('Hello World!')
  console.log("`/` hit")
})

app.get('/fileserver/*', function(request, response) {
    console.log("`"+url.parse(request.url).pathname+"` hit")
    var uri = url.parse(request.url).pathname.replace("/fileserver","");
    console.log("uri",uri);
    var filename = path.join(process.cwd(), uri);
    console.log("filename",filename);
    path.exists(filename, function(exists) {
        if(!exists || uri == "/") {
            response.writeHead(404, {"Content-Type": "text/plain"});
            response.end("404 `"+filename+"` not found");
            return;
        }

        fs.readFile(filename, "binary", function(err, file) {
            if(err) {
                response.writeHead(500, {"Content-Type": "text/plain"});
                response.end(err);
                return;
            }

            response.writeHead(200);
            response.end(file, "binary");
        });
    });
})

app.listen(app.get('port'), function() {
  console.log("Node app is running at port:" + app.get('port'))
})
