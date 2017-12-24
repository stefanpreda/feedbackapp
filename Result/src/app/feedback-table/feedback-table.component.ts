import { Component, OnInit, NgZone } from '@angular/core';

import { Feedback } from '../feedback';

@Component({
  selector: 'app-feedback-table',
  templateUrl: './feedback-table.component.html',
  styleUrls: ['./feedback-table.component.css']
})
export class FeedbackTableComponent {

  feedbacks = [];

  constructor(private _ngZone: NgZone) {
    this.requestData();

    var intervalID = setInterval( () => {
      console.log("Automatic refresh triggered");
      this.requestData();
    }, 30000);
    
  }


  requestData() {
    var http = require("http");

    //Request data from the helper service
    var options = {
      hostname: 'localhost',
      port: '4101',
      path: '/update_request',
      method: 'GET',
      headers: {'Access-Control-Allow-Origin':'*'},
      self: this
    };

    var req = http.request(options, res => {
      console.log('Status: ' + res.statusCode);
      console.log('Headers: ' + JSON.stringify(res.headers));
      res.setEncoding('utf8');

      var objref = options.self;

      var new_feedbacks = []

      res.on('data', function(event) {
        console.log("RECEIVED DATA");

        var parsedJSON = JSON.parse(event);
        for (var i = 0; i < parsedJSON.feedbacks.length; i++) {
          var f = <Feedback>parsedJSON.feedbacks[i];
          new_feedbacks.push(f);
        }
      });

      res.on('end', function(event) {
       
        objref._ngZone.run(() => {
          objref.feedbacks = new_feedbacks;
        });
        console.log("END RESPONSE: " + new_feedbacks);
      })

    });

    req.on('error', function(e) {
      console.log('Problem with request: ' + e.message + ' ' + e.statusCode);
    });

    req.end();
    console.log("Sent http update request");
  }

}
