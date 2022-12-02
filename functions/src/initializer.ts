import express, { Express, Request, Response } from 'express';
import cookieParser from "cookie-parser";
import cors, { CorsOptions } from "cors";
import ReactDOMServer from "react-dom/server.js";
import * as icons from "./icons/all.js";

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
      console.log(origin, whitelist);
      !originUrl || whitelist.indexOf(originUrl) !== -1
        ? callback(null, true)
        : callback(new Error("Not allowed by CORS"), undefined);
    },
    credentials: true,
  };
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cors(corsOptions));
  app.use(cookieParser());
}

function injectRouteMW(app: express.Express) {
  app.get(
    "/icon/:source/:name/:color?/:size?/:className?",
    function (req: Request, res: Response) {
      const { source, name, ...props } = req.params;
      const iconSpace: Object = icons[source as keyof Object];
      res.set("Content-Type", "image/svg+xml");
      console.log(iconSpace[name as keyof Object]);
      res.send(ReactDOMServer.renderToString(iconSpace[name as keyof Object](props)));
    }
  );

  app.get("/image", function (req: Request, res: Response) {
    res.send("Returning image!");
  });
  app.get("/doc", function (req: Request, res: Response) {


  });
  app.get("/config/:org/:space/:name", function (req: Request, res: Response) {

  })
}

function injectMiddlewares(app: Express) {
  injectLibMW(app);
  injectRouteMW(app);
}

injectMiddlewares(app);

const listenPort = process.env.PORT || 8080;
app.listen(listenPort, () => {
  console.log(`App running on the port ${listenPort}`);
});

export default app;