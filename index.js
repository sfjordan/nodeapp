var express = require('express')
var app = express();
var counter = 0;

app.set('port', (process.env.PORT || 5000))
app.use(express.static(__dirname + '/public'))

app.get('/', function(request, response) {
  response.send('Hello World!')
  console.log("console test", counter)
  counter++;
})

app.get('fileserver/', function(request, response) {
    var uri = url.parse(request.url).pathname;
    console.log("uri",uri);
    var filename = path.join(process.cwd(), uri);
    console.log("filename",filename);
}

app.listen(app.get('port'), function() {
  console.log("Node app is running at port:" + app.get('port'))
})
