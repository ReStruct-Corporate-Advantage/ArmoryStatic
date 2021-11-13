var express = require("express");
var cookieParser = require("cookie-parser");
var cors = require("cors");

function injectLibMW (app) {
    var whitelist = ["http://localhost:7992", "https://armory-ui.herokuapp.com"]
    var corsOptions = {
        origin: (origin, callback) => {
            (!origin || whitelist.indexOf(origin) !== -1) ? callback(null, true) :  callback(new Error("Not allowed by CORS"))
        },
        credentials: true
    }
    app.use(express.json());
    app.use(express.urlencoded({extended: true}));
    app.use(cors(corsOptions))
    app.use(cookieParser())
}

module.exports = injectLibMW;