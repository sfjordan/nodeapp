var express = require('express')
var app = express();
var url = require("url"),
    bodyParser = require('body-parser'),
    path = require("path"),
    pg = require('pg'),
    fs = require("fs");

// parse application/json
app.use(bodyParser.json())


app.set('port', (process.env.PORT || 5000))
app.use(express.static(__dirname + '/public'))

app.get('/db', function (request, response) {
  //console.log('request',reques    t)
  pg.connect(process.env.DATABASE_URL, function(err, client, done) {
    client.query('SELECT * FROM tigertidal', function(err, result) {
      done();
      if (err)
       { console.error(err); response.send("Error " + err); }
      else {
        var str = JSON.stringify(result.rows).split(']')[0].split('[')[1]
        var retstr = '{"activeUsers":['+str+']}'
        // console.log("retstr", str)
        response.send(retstr);
        response.end();
        }
    });
  });
})

app.post('/db', function (request, response) {
  var dbname = "tigertidal"
  var firstname = request.body.firstname
  var lastname = request.body.lastname
  var uid = request.body.uid
  var classyear = request.body.classyear
  var longitude = request.body.longitude
  var latitude = request.body.latitude
  var heading = request.body.heading
  var speed = request.body.speed
  var updatestr = "UPDATE "+dbname+" set firstname='"+firstname+"', lastname='"+lastname+"', classyear='"+classyear+"', longitude="+longitude+", latitude="+latitude+", heading="+heading+", speed="+speed
  updatestr += " WHERE uid like '"+uid+"';"
  var insertstr = "INSERT INTO tigertidal (firstname, lastname, uid, classyear, longitude, latitude, heading, speed)"
  insertstr += " SELECT '"+firstname+"', '"+lastname+"', '"+uid+"', '"+classyear+"', "+longitude+", "+latitude+", "+heading+", "+speed
  insertstr += " WHERE NOT EXISTS (SELECT 1 FROM "+dbname+" WHERE uid like '"+uid+"');"
  var success = true; 
  pg.connect(process.env.DATABASE_URL, function(err, client, done) {
    client.query( updatestr, function(err, result) {
      done();
      if (err) {
        console.log(err); response.send("Error: "+err)
        success = false;
      }
    });
    client.query( insertstr, function(err, result) {
      done();
      if (err) {
        console.log(err); response.send("Error: "+err)
        success = false;
      }
    });
  });
  if (success)
    response.status(200).end();
  else response.status(500).end();
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
