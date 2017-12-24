var http = require('http');

http.createServer(function(req, res) {
    if (req.url === '/update_request') {
        console.log("Received update request")
        res.writeHead(200, {'Content-Type': 'text', 'Access-Control-Allow-Origin':'*', 'Access-Control-Allow-Headers': 'access-control-allow-origin'});
        
        var pg = require('pg');
        
        //Username and password are "posgres" "" and hostname is "db"
        var connectionString = 'postgres://postgres@db/postgres';
        var pgClient = new pg.Client(connectionString);

        pgClient.connect();
        
        results = [];

        var pendingResult = pgClient.query("SELECT * from feedbacks");
        
        pendingResult.then(function(result){
            //console.log(result);

            var feedbacks = "{\"feedbacks\":[";

            result.rows.forEach(row => {
                feedbacks = feedbacks + JSON.stringify(row) + ",";
            });
            
            feedbacks = feedbacks.substring(0, feedbacks.length - 1);
            feedbacks = feedbacks + "]}"
            
            console.log(feedbacks);

            pgClient.end(); 

            res.write(feedbacks);
            res.end();
            console.log("Sent update");
        });
    }
}).listen(4101);