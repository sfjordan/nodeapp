var sys = require("sys"),
    http = require("http"),
    url = require("url"),
    path = require("path"),
    fs = require("fs");

http.createServer(function(request, response) {
    var uri = url.parse(request.url).pathname;
    console.log("uri",uri);
    if (uri == "/") {
        response.writeHead(500, {"Content-Type": "text/plain"});
        response.end("Hello, World; Empty path!");
        return;
    }
    var filename = path.join(process.cwd(), uri);
    console.log("filename",filename);
    path.exists(filename, function(exists) {
        if(!exists) {
            response.writeHead(404, {"Content-Type": "text/plain"});
            response.end("404 Not Foundn");
            return;
        }

        fs.readFile(filename, "binary", function(err, file) {
            if(err) {
                response.writeHead(500, {"Content-Type": "text/plain"});
                response.end(err + "n");
                return;
            }

            response.writeHead(200);
            response.end(file, "binary");
        });
    });
}).listen(5000);

console.log("Server running at http://localhost:8080/");