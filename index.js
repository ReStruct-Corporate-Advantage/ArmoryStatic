import express from "express";
import http from "http";
import cookieParser from "cookie-parser";
import cors from "cors";
import ReactDOMServer from "react-dom/server.js";
import {extractRootDomain} from "./helpers/index.js";
import * as icons from "./icons/all.js";

const app = express();
const server = http.Server(app);

function injectLibMW(app) {
  const whitelist = [
    "http://localhost:7992",
    "http://localhost:3000",
    "https://restruct-corporate-advantage.github.io",
    "https://www.armco.tech",
    "https://armco.tech",
    "http://www.armco.tech",
    "http://armco.tech",
  ];
  const supportedDomains = ["notabuck.com", "armco.tech"];
  const corsOptions = {
    origin: (origin, callback) => {
      console.log(origin, whitelist);
      const domain = extractRootDomain(origin);
      const supportedEndpoint = supportedDomains.indexOf(domain) > -1;
      if (!origin || whitelist.indexOf(origin) !== -1 || supportedEndpoint) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  };
  app.use(express.json());
  app.use(express.urlencoded({extended: true}));
  app.use(cors(corsOptions));
  app.use(cookieParser());
}

function injectRouteMW(app) {
  app.get(
    "/icon/:source/:name/:color?/:size?/:className?",
    function (req, res) {
      const {source, name, ...props} = req.params;
      res.set("Content-Type", "image/svg+xml");
      res.send(ReactDOMServer.renderToString(icons[source][name](props)));
    }
  );
  app.get(["/icon", "icons"], function (req, res) {
    res.send(
      "Use URL in the format /icon/<category>/<icon>/<optional_color>/<optional_size>/<optional_class>"
    );
  });
  app.get("/icons/:color?/:size?/:className?", function (req, res) {
    const iconsRenders = Object.keys(icons).reduce((acc, group) => {
      const sourceObj = icons[group];
      return acc.concat(
        Object.keys(sourceObj).map((name) => {
          const CompFunc = sourceObj[name];
          return {
            name,
            group,
            svg: ReactDOMServer.renderToString(
              CompFunc && typeof CompFunc === "function" && CompFunc(req.params)
            ),
          };
        })
      );
    }, []);
    res.send(iconsRenders);
  });

  app.get("/image", function (req, res) {
    res.send("Returning image!");
  });
  app.get("/doc", function (req, res) {
    res.send("Returning doc");
  });
}

function injectMiddlewares(app) {
  injectLibMW(app);
  injectRouteMW(app);
}

injectMiddlewares(app);

const listenPort = process.env.PORT || 8080;
server.listen(listenPort, () => {
  console.log(`App running on the port ${listenPort}`);
});
