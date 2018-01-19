"use strict";
 
// Include the Alexa SDK
var Alexa = require("alexa-sdk");
var http = require("http");
 
// The handlers object tells Alexa how to handle various actions
var handlers = {
    "LaunchRequest": function () {
      this.emit(":tell", "Welcome to Bitcoin Price Checker"); // Create speech output. This is what Alexa will speak back when the user says "Open bitcoin checker"
    },
    "PriceIntent": function () {
        //https://blockchain.info/ticker- URL for the api call to get current price.
        var options = {
            host: 'blockchain.info',
            port: 80,
            method: 'GET',
            path: '/ticker'
        }
        var req = http.request(options, res => {
            res.setEncoding('utf8');
            var returnData = "";
            
            res.on('data', chunk => {
                returnData =  returnData + chunk;
            });
            
            res.on('end', () => {
                var result = JSON.parse(returnData);
                var btcPrice = result.USD.last;
                this.emit(":tell", "The current price of Bitcoin is " + btcPrice + " USD"); // Calls the SayWelcomeMessage handler. This is what Alexa will speak back when the user says "Ask bitcoin checker to say the price"
                this.emit(":responseReady");
            });
        })
        
        req.end();
     
    }
};
 
 
// This is the function that AWS Lambda calls every time Alexa uses your skill.
exports.handler = function(event, context, callback) {
    // Create an instance of the Alexa library and pass it the requested command.
    var alexa = Alexa.handler(event, context);
 
    // Give our Alexa instance instructions for handling commands and execute the request.
    alexa.registerHandlers(handlers);
    alexa.execute();
};