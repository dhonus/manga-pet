module.exports = {sendEmail};

const path = require("path");

let express = require('express');
const cors = require('cors');
let http = require('http');
let nodemailer = require('nodemailer');
const {response} = require("express");
const {getCreds} = require("../app");
let ex_app = express();

// enable cors
ex_app.use(cors());
ex_app.options('*', cors());


let server = http.createServer(ex_app);
let port = 502;

ex_app.set("port", port);
ex_app.use(express.json);
ex_app.use(express.urlencoded({extended: true}));

ex_app.use(express.static(path.join(__dirname, 'static')));

// routing
ex_app.get('/send', function (req, res) {
    res.sendFile(path.join(__dirname, 'static', 'send.html'));
});

server.listen("starting server on port " + port);

async function sendEmail(file) {

    const creds = getCreds();

    let transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false, // upgrade later with STARTTLS
        auth: {
            user: creds.gmail,
            pass: creds.pass,
        },
    });

    // send mail with defined transport object
    let info = await transporter.sendMail({
        from: '"manga.pet.👻" ' + creds.gmail, // sender address
        to: creds.kindle,
        subject: "",
        text: "",
        html: "<div dir=\"auto\"></div>", // html body
        attachments: [
            {
                filename: file + ".epub",
                path: './temp/manga_out/' + file + '.epub',
            }
        ]
    });

    console.log('./temp/manga_out/' + file + '.epub');
    console.log("Message sent: %s", info.messageId);
}

