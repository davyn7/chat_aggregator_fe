// /**
//  * Copyright 2016-present, Facebook, Inc.
//  * All rights reserved.
//  *
//  * This source code is licensed under the license found in the
//  * LICENSE file in the root directory of this source tree.
//  */

// var bodyParser = require('body-parser');
// var express = require('express');
// var app = express();
// var xhub = require('express-x-hub');

// app.set('port', (process.env.PORT || 5000));
// app.listen(app.get('port'));

// app.use(xhub({ algorithm: 'sha1', secret: process.env.APP_SECRET }));
// app.use(bodyParser.json());

// var token = process.env.TOKEN || 'token';
// var received_updates = [];

// app.get('/', function(req, res) {
//   console.log(req);
//   res.send('<pre>' + JSON.stringify(received_updates, null, 2) + '</pre>');
// });

// app.get(['/facebook', '/instagram'], function(req, res) {
//   if (
//     req.query['hub.mode'] == 'subscribe' &&
//     req.query['hub.verify_token'] == token
//   ) {
//     res.send(req.query['hub.challenge']);
//   } else {
//     res.sendStatus(400);
//   }
// });

// app.post('/facebook', function(req, res) {
//   console.log('Facebook request body:', req.body);

//   if (!req.isXHubValid()) {
//     console.log('Warning - request header X-Hub-Signature not present or invalid');
//     res.sendStatus(401);
//     return;
//   }

//   console.log('request header X-Hub-Signature validated');
//   // Process the Facebook updates here
//   received_updates.unshift(req.body);
//   res.sendStatus(200);
// });

// app.post('/instagram', function(req, res) {
//   console.log('Instagram request body:');
//   console.log(req.body);
//   // Process the Instagram updates here
//   received_updates.unshift(req.body);
//   res.sendStatus(200);
// });

// app.listen();

const express = require("express");
const body_parser = require("body-parser");
const axios = require("axios");
require("dotenv").config();

const app = express().use(body_parser.json());

const token = process.env.APP_SECRET;
const mytoken = process.env.TOKEN;

app.listen(process.env.PORT, () => {
    console.log("Webhook is listening.");
});

// To verify the callback url from dashboard side - cloud api side
app.get("/facebook", (req, res) => {
    let mode = req.query["hub.mode"];
    let challenge = req.query["hub.challenge"];
    let token = req.query["hub.verify_token"];

    if (mode && token) {
        if (mode === "subscribe" && token === mytoken) {
            res.status(200).send(challenge);
            console.log("Webhook verified!");
        } else {
            res.status(403);
        }
    }
});

app.post("/facebook", (req, res) => {
    let body_param = req.body;

    console.log("Inside this function");

    console.log(JSON.stringify(body_param, null, 2));

    if (body_param.object) {
        console.log("inside body param");
        if (body_param.entry && 
            body_param.entry[0].changes &&
            body_param.entry[0].changes[0].value.messages &&
            body_param.entry[0].changes[0].value.messages[0]) {

            let phone_number_id = body_param.entry[0].changes[0].value.metadata.phone_number_id;
            let sender = body_param.entry[0].changes[0].value.messages[0].from;
            let msg_body = body_param.entry[0].changes[0].value.messages[0].text.body; 

            console.log("phone number " + phone_number_id);
            console.log("from " + sender);
            console.log("body param " + msg_body);

            axios({
                method: "POST",
                url: "https://graph.facebook.com/v18.0/" + phone_number_id + "/messages?access_token=" + token,
                data: {
                    messaging_product: "whatsapp",
                    to: sender,
                    text: {
                        body: "Hello, I'm Davyn. Your message is " + msg_body
                    },
                    headers: {  
                        "Content-Type": "application/json"
                    }
                }
            });
            
            res.sendStatus(200);
        } else {
            res.sendStatus(404);
        }
    }
});

app.get("/", (req, res) => {
    res.status(200).send("Hello this is webhook setup");
});