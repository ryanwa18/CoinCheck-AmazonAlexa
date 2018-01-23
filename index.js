/**
 * @author Ryan Ward
 * @version 1.0
 * 
 * This is a small alexa skill that can tell a user the price of several different cryptocurrencies.
 */

"use strict";
 
// Include the Alexa SDK
var Alexa = require("alexa-sdk");
var https = require("https");
 
// The handlers object tells Alexa how to handle various actions
var handlers = {
    "LaunchRequest": function () {
      this.emit(":tell", "Welcome to Crypto Check!"); // Create speech output. This is what Alexa will speak back when the user says "Open bitcoin checker"
    },
    "PriceIntent": function () {
        var crypto = this.event.request.intent.slots.cryptocurrency.value;
        if (typeof(crypto) != "undefined") {
            crypto = crypto.toLowerCase();
            var path = "https://api.coinmarketcap.com/v1/ticker/" + crypto + "/";
            //https://api.coinmarketcap.com/v1/ticker/ URL for the api call to get current price.
            var req = https.get(path, res => {
                res.setEncoding('utf8');
                var returnData = "";
                
                res.on('data', chunk => {
                    returnData =  returnData + chunk;
                });
                
                res.on('end', () => {
                    var result = JSON.parse(returnData);
                    var price = result[0].price_usd;
                    // Ensures that a cryptocurrency was spoken by the user.
                    this.emit(":tell", "The current price of " + crypto + " is " + price + " USD");
                    this.emit(":responseReady");
                });
            });
            
            req.end();
        }
        else {
            this.emit(":tell", "I'm sorry, I didn't get that. Could you please ask the question again?");
            this.emit(":responseReady");
        }
     
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
