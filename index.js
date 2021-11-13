import express from "express";
import http from "http";
import cookieParser from "cookie-parser";
import cors from "cors";
import * as icons from "./icons/all.js";

const app = express();
const server = http.Server(app);


function injectLibMW (app) {
    const whitelist = ["http://localhost:7992", "https://armory-ui.herokuapp.com"]
    const corsOptions = {
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

function injectRouteMW (app) {
    app.get("/icon/:source/:name", function (req, res) {
        const source = req.params.source;
        const name = req.params.name;
        res.send(icons[source][name]());
    })
    
    app.get("/image", function (req, res) {
        res.send("Returning image!");
    })
    app.get("/doc", function (req, res) {
        res.send("Returning doc")
    })
}

function injectMiddlewares (app) {
    injectLibMW(app);
    injectRouteMW(app);
}

injectMiddlewares(app);

const listenPort = process.env.PORT || 8080;
server.listen(listenPort, () => {
    console.log(`App running on the port ${listenPort}`);
})