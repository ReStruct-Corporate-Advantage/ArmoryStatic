import express, {Express, Request, Response} from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors, {CorsOptions} from "cors";
import ReactDOMServer from "react-dom/server.js";
import { APP_ROOT } from "./constants.js";
import * as icons from "./icons/all.js";

dotenv.config();

const app: Express = express();

function injectLibMW(app: Express) {
  const whitelist = [
    "http://localhost:7992",
    "https://armory-server.web.app",
    "http://armory-server.web.app",
    "https://armory-server.firebaseapp.com",
    "http://armory-server.firebaseapp.com",
    "https://restruct-corporate-advantage.github.io",
    "https://www.armco.tech",
    "https://armco.tech",
    "http://www.armco.tech",
    "http://armco.tech",
  ];
  const corsOptions: CorsOptions = {
    origin: (originUrl, callback) => {
      console.log(originUrl, whitelist);
      !originUrl || whitelist.indexOf(originUrl) !== -1 ?
        callback(null, true) :
        callback(new Error("Not allowed by CORS"), undefined);
    },
    credentials: true,
  };
  app.use(express.json());
  app.use(express.urlencoded({extended: true}));
  app.use(cors(corsOptions));
  app.use(cookieParser());
  app.use((req, res, next) => {
    req.url = req.url.startsWith(APP_ROOT) ? req.url.substring(APP_ROOT.length) : req.url;
    next();
  });
}

function injectRouteMW(app: Express) {
  console.log("Registering Routes....");
  app.get("/", function(req: Request, res: Response) {
    console.log("handler called");
    res.send("Hello from Armory's Static Content Server");
  });
  app.get(
      "/icon/:source/:name/:color?/:size?/:className?",
      function(req: Request, res: Response) {
        const {source, name, ...props} = req.params;
        const iconSpace = icons[source as keyof Object];
        const iconFunc = iconSpace[name as keyof Object];
        // @ts-ignore
        const renderableIcon = iconFunc(props);
        res.set("Content-Type", "image/svg+xml");
        res.send(ReactDOMServer.renderToString(renderableIcon));
      }
  );

  app.get("/image", function(req: Request, res: Response) {
    res.send("Returning image!");
  });
  app.get("/doc", function(req: Request, res: Response) {
    res.send("Returning Doc!");
  });
  app.get("/config/:org/:space/:name", function(req: Request, res: Response) {
    res.send("Returning config!");
  });
  console.log("Routes registered successfully!");
}

function injectMiddlewares(app: Express) {
  injectLibMW(app);
  injectRouteMW(app);
}

injectMiddlewares(app);

// const listenPort = process.env.APP_PORT || 8080;
// app.listen(listenPort, () => {
//   console.log(`App running on the port ${listenPort}`);
// });

export default app;
