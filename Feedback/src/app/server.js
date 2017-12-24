//Run this with: sudo npm run start-server
var express = require('express');
var app = express();

app.post('/new_feedback', function(req, res) {

    console.log('Received request');

    
    if (req.method == 'POST') {
        req.on('data', function(data){
            console.log(data.toString());

            var redis = require('redis');
            //Host is called 'redis'
            var redisClient = redis.createClient({host : 'redis', port : 6379});
            
            redisClient.on('ready',function() {
                console.log('Connected to redis');
                redisClient.rpush(['feedbacks', data.toString()]);
                redisClient.quit();
            });

            // redisClient.quit();
        });
    }

});

var server = app.listen(4201, function () {

  var host = server.address().address;
  var port = server.address().port;

  console.log("Server listening at %s:%s", host, port);

});