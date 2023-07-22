import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors, { CorsOptions } from "cors";
import ReactDOMServer from "react-dom/server.js";
import Helper from "./helper";
import { extractRootDomain } from "./helpers";
import { download } from "./storage/controller";
import { APP_ROOT } from "./constants.js";
import FONTS_CONFIG from "./fonts/google-fonts";
import * as icons from "./icons/all.js";

dotenv.config();

const app: Express = express();

function injectLibMW(app: Express) {
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
  const corsOptions: CorsOptions = {
    origin: (originUrl, callback) => {
      console.log("Request Originated from -- ", originUrl, "...... Whitelisted origins -- ", whitelist.join(","));
      const domain = extractRootDomain(origin);
      const supportedEndpoint = supportedDomains.indexOf(domain) > -1;
      !originUrl || whitelist.indexOf(originUrl) !== -1 || supportedEndpoint ?
        callback(null, true) :
        callback(new Error("Not allowed by CORS"), undefined);
    },
    credentials: true,
  };
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cors(corsOptions));
  app.use(cookieParser());
  app.use((req, res, next) => {
    req.url = req.url.startsWith(APP_ROOT) ? req.url.substring(APP_ROOT.length) : req.url;
    req.url = !req.url ? "/" : req.url;
    next();
  });
  app.use('/scripts', express.static(__dirname + '/node_modules/bootstrap/dist/'));
}

function injectRouteMW(app: Express) {
  console.log("Registering Routes....");
  app.get("/", function (req: Request, res: Response) {
    console.log("handler called");
    res.send("Hello from Armory's Static Content Server");
  });
  app.get(
    "/icon/:source/:name/:color?/:size?/:className?",
    function (req: Request, res: Response) {
      const { source, name, ...props } = req.params;
      const iconSpace = icons[source as keyof Object];
      const iconFunc = iconSpace[name as keyof Object];
      // @ts-ignore
      const renderableIcon = iconFunc(props);
      res.set("Content-Type", "image/svg+xml");
      res.send(ReactDOMServer.renderToString(renderableIcon));
    }
  );

  app.get("/image", function (req: Request, res: Response) {
    res.send("Returning image!");
  });
  app.get("/doc", function (req: Request, res: Response) {
    res.send("Returning Doc!");
  });
  app.get("/config/:org/:space/:name", function (req: Request, res: Response) {
    res.send("Returning config!");
  });
  app.get("/font/config/:name", function (req: Request, res: Response) {
    const { name } = req.params;
    const fontConfig = FONTS_CONFIG[name as keyof Object];
    if (!fontConfig) {
      res.send("Unable to find descriptor for the requested font: " + name);
    }
    res.send(fontConfig);
  });
  app.get("/font/:name/:style?/:weight?", function (req: Request, res: Response) {
    const { name, ...params } = req.params;
    const userAgent = req.get("User-Agent");
    const format = Helper.getFontTypeFromAgent(userAgent);
    params.format = format;
    let returnFonts;
    const configName = name.replace(/\+/g, " ");
    /* eslint-ignore @typescript-eslint/no-explicit-any */
    const fontConfig: any = FONTS_CONFIG[configName as keyof object];
    const isLocalHost = req.hostname === "localhost" || req.hostname === "127.0.0.1";
    const host = isLocalHost ? `http://localhost:${process.env.APP_PORT}` : "https://armco.tech";
    params.host = host;
    if (!fontConfig) {
      res.send("Couldn't find descriptor for the requested font: " + name + ". Please check it's spelled properly");
    }
    if (format === "woff2") {
      returnFonts = fontConfig.subsets && fontConfig.subsets.reduce((acc: string, subset: string) => {
        params.subset = subset;
        return acc + Helper.generateFont(name, fontConfig, params);
      }, "");
    } else {
      returnFonts = Helper.generateFont(name, fontConfig, params);
    }
    res.setHeader("Content-Type", "text/css; charset=utf-8");
    res.send(returnFonts);
  });
  app.get("/f-local/:family/:specs?", function (req: Request, res: Response) {
    console.log("Received Request with params: ", req.params);
    const { family, specs } = req.params;
    const { fontFileName, contentType } = Helper.getFileNameAndContentTypeFromSpecs(family, specs);

    res.set("Content-Type", contentType);
    res.download("src/fonts/all/" + fontFileName);
  });
  app.get("/f/:family/:specs?", function (req: Request, res: Response) {
    console.log("Received Request with params: ", req.params);
    const { family, specs } = req.params;
    const { fontFileName, contentType } = Helper.getFileNameAndContentTypeFromSpecs(family, specs);
    const promise = download(fontFileName, "fonts");
    promise.then((response) => {
      const processed = Buffer.from(response);
      res.set("Content-Type", contentType);
      res.set("Content-Disposition", `attachment; filename="${fontFileName}"`);
      res.set("Content-Length", "" + processed.length);
      res.end(processed);
    });
  });
  console.log("Routes registered successfully!");
}

function injectMiddlewares(app: Express) {
  injectLibMW(app);
  injectRouteMW(app);
}

injectMiddlewares(app);

const listenPort = process.env.APP_PORT || 8080;
app.listen(listenPort, () => {
  console.log(`App running on the port ${listenPort}`);
});
