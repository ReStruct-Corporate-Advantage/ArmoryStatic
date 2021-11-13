/* eslint-disable var/first */
var express = require("express");
var http = require("http");
var injectMiddlwares = require("./middlewares/index.js");

var app = express();
var server = http.Server(app);

injectMiddlwares(app);

const listenPort = process.env.PORT || 8080;
server.listen(listenPort, () => {
    console.log(`App running on the port ${listenPort}`);
})