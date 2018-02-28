/**
 * @author Ryan Ward
 * @version 1.4
 * 
 * This is a small alexa skill that can tell a user the price of several different cryptocurrencies.
 * Currently the skill only responds with the USD value of each cryptocurrency.
 * 
 * Please note that this is the first released version on the Alexa Skill Store.
 * 
 * Future Plans:
 * - Support different currencies other than USD, depending on the location of the user.
 */

"use strict";
 
// Include the Alexa SDK
var Alexa = require("alexa-sdk");
// Include https to be able to make api calls.
var https = require("https");

// The different messages corresponding to the different intents.
var errorMessage = "I'm sorry, I didn't get that. Could you please ask again?";
var helpMessage = "Simply ask for the price of any popular cryptocurrency. For example you could say, 'ask coin check for the current price of Bitcoin.'";
var launchMessage = "Welcome to coin check! What currency do you want to hear the price of?";
var goodbyeMessage = "Goodbye!";
var thresholdMessage = "Please ask for the top one or more cryptocurrencies. Could you please ask again?"

var DEFAULT_TOP_CURRENCIES = 5;
 
// The handlers object tells Alexa how to handle various actions
var handlers = {
    
    /**
     * The LaunchRequest is called when the user asks 'Alexa open coin check.'
     */
    "LaunchRequest": function () 
    {
      this.emit(":ask", launchMessage);
      this.emit(":responseReady");
    },
    /**
     * The HelpIntent is called when the user responds to the prompt with 'Help.'
     */
    "AMAZON.HelpIntent": function() {
        this.emit(":ask", helpMessage);
        this.emit(":responseReady");
    },
    /**
     * The PriceIntent is called when the user responds to the prompt with the name
     * of a popular cryptocurrency.
     */
    "PriceIntent": function () 
    {
        var answerSlotValid = isAnswerSlotValid(this.event.request.intent);
        
        if (!answerSlotValid || this.event.request.intent.slots.cryptocurrency.value == null) {
            this.emit(":ask", errorMessage);
            this.emit(":responseReady");
        }
        else {
            var crypto = this.event.request.intent.slots.cryptocurrency.value;
            if (typeof(crypto) != "undefined") 
            {
                crypto = crypto.toLowerCase();
                crypto = crypto.replace(" ", "-");
                var path = "https://api.coinmarketcap.com/v1/ticker/" + crypto + "/";
                var req = https.get(path, res => 
                {
                    res.setEncoding('utf8');
                    var returnData = "";
                    
                    res.on('data', chunk => {
                        returnData =  returnData + chunk;
                    });
                    
                    res.on('end', () => {
                        try {
                            var result = JSON.parse(returnData);
                            if (typeof(result[0]) == "undefined") {
                                this.emit(":ask", errorMessage);
                                this.emit(":responseReady");
                            }
                            else {
                                var price = result[0].price_usd;
                                var priceMessage = "The current price of " + crypto + " is " + price + " USD";
                                this.emit(":tell", priceMessage);
                                this.emit(":responseReady");
                            }
                        }
                        catch (e) {
                            this.emit(":ask", errorMessage);
                            this.emit(":responseReady");
                        }
                    });
                    
                    res.on('error', () => {
                        this.emit(":ask", errorMessage);
                        this.emit(":responseReady");
                    });
                });
                
                req.end();
            }
        }
    },
    /**
     * The TopCurrencies function is called when the user asks for the top currencies.
     * If the {number} is left out of the request then the response returns the top 5 currencies.
     */
     "TopCurrencies": function() {
        var number = this.event.request.intent.slots.number.value;
        
        if (number == null) {
            number = DEFAULT_TOP_CURRENCIES;
        }
        else if (number < 1) {
            this.emit(":ask", thresholdMessage);
            this.emit(":responseReady");
        }
        
        var path = "https://api.coinmarketcap.com/v1/ticker/?limit=" + number;
        
        var req = https.get(path, res => 
            {
                res.setEncoding('utf8');
                var returnData = "";
                
                res.on('data', chunk => {
                    returnData =  returnData + chunk;
                });
                
                res.on('end', () => {
                    try {
                        var result = JSON.parse(returnData);
                        if (typeof(result[0]) == "undefined") {
                            this.emit(":ask", errorMessage);
                            this.emit(":responseReady");
                        }
                        else {
                            var list = "The top " + number + " currencies are " + currencyList(result);
                            this.emit(":tell", list);
                            this.emit(":responseReady");
                        }
                    }
                    catch (e) {
                        this.emit(":ask", errorMessage);
                        this.emit(":responseReady");
                    }
                });
                
                res.on('error', () => {
                    this.emit(":ask", errorMessage);
                    this.emit(":responseReady");
                });
            });
                
            req.end();
     },
    /**
     * The Unhandled function is called when an unspecified for in the intent is present.
     */
    "Unhandled": function() {
        this.emit(":ask", errorMessage);
        this.emit(":responseReady");
    },
    /**
     * The CancelIntent function is called when the user responds to the prompt with 'Cancel.'
     */
    'AMAZON.CancelIntent': function () { 
        this.emit(':tell', goodbyeMessage);
    },
    /**
     * The StopIntent function is called when the user responds to the prompt with 'Stop.'
     */
    'AMAZON.StopIntent': function () { 
        this.emit(':tell', goodbyeMessage);
    }
};

/**
 * Returns false if the answer slot is not valid and true otherwise.
 * For example if the answer slot was "", this would return false.
 * However if the answer slot was "Bicoin", this would return true.
 */
function isAnswerSlotValid(intent) {
    var answerSlotFilled = intent && intent.slots &&
        intent.slots.cryptocurrency && intent.slots.cryptocurrency.value;
    return answerSlotFilled;
}

/**
 * Returns a list of the currencies from the parsed JSON response as a string.
 */
function currencyList(result) {
    var list = "";
    for (var i = 0; i < result.length - 1; i++) {
        list += result[i].name + ", ";
    }
    list += "and " + result[result.length - 1].name;
    return list;
}

 
// This is the function that AWS Lambda calls every time Alexa uses your skill.
exports.handler = function(event, context, callback) {
    // Create an instance of the Alexa library and pass it the requested command.
    var alexa = Alexa.handler(event, context);
 
    // Give our Alexa instance instructions for handling commands and execute the request.
    alexa.registerHandlers(handlers);
    alexa.execute();
};
