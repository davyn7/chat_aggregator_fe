const express = require("express");
const body_parser = require("body-parser");
const axios = require("axios");
require("dotenv").config();

const app = express().use(body_parser.json());

const token = process.env.TOKEN;
const mytoken = process.env.MYTOKEN;

app.listen(process.env.PORT, () => {
    console.log("Webhook is listening.");
});

// To verify the callback url from dashboard side - cloud api side
app.get("/webhook", (req, res) => {
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

app.post("/webhook", (req, res) => {
    let body_param = req.body;

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
                        body: "Hello, I'm Davyn."
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