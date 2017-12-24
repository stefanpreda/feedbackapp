//Run this with: sudo npm start
import { Component, OnInit } from '@angular/core';

import { Feedback } from '../feedback'

@Component({
  selector: 'app-feedback-form',
  templateUrl: './feedback-form.component.html',
  styleUrls: ['./feedback-form.component.css']
})
export class FeedbackFormComponent {

  service_names = ['ServiceA', 'ServiceB', 'ServiceC'];
  timelinesses = ['Very fast', 'Fast', 'Slow', 'Just right','Slow', 'Very slow'];
  qualities = ['Very good', 'Good', 'Satisfactory', 'Bad', 'Very bad'];
  overall_satisfactions = ['Very satisfied', 'Satisfied', 'Unsatisfied', 'Very Unsatisfied'];
  use_service_agains = ['Yes', 'No'];

  model =  new Feedback('', 18, '', '', '','', '');

  submitted = false;

  onSubmit() {
    var http = require("http");
    
    var json = JSON.stringify(this.model);

    console.log('Sending request to helper service: ' + this.model);

    //Use the helper service to store the feedbacks.
    var options = {
      hostname: 'localhost',
      port: '4201',
      path: '/new_feedback',
      method: 'POST'
    };

    var req = http.request(options, function(res) {
      console.log('Status: ' + res.statusCode);
      console.log('Headers: ' + JSON.stringify(res.headers));
      res.setEncoding('urf8');
      res.on('data', function(body) {
        console.log('Body: ' + body);
      });
    });

    req.on('error', function(e) {
      console.log('Problem with request: ' + e.message + ' ' + e.statusCode);
    });

    req.write(JSON.stringify(this.model));
    req.end();

    console.log('Request sent');
    console.log(req);

    this.submitted = true;
  }

  //{"name":"ana","age":10,"service_name":"ServiceA","timeliness":"Fast","quality":"Very good","overall_satisfaction":"Unsatisfied","use_service_again":"Yes"} 
  get diagnostic() { return JSON.stringify(this.model); }
}
