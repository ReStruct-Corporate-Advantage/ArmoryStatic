import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import rootInit from "@armco/node-starter-kit";
import BaseRouter from "./routes";

dotenv.config();

const app: Express = express();

function injectRouteMW(app: Express) {
  logger.info("Registering Routes....");
  app.get("/", function (req: Request, res: Response) {
    console.log("handler called");
    res.json({success: true, message: "Hello from Armory's Static Content Server"});
  });
  app.use("/api", BaseRouter);
  app.use("/static", express.static(__dirname + "/icons/downloaded/tnp"));
  logger.info("Routes registered successfully!");
}

rootInit(app);
injectRouteMW(app);

const listenPort = ARMCOSTATIC.appConfig?.app?.port || process.env.APP_PORT || 8081;
app.listen(listenPort, () => {
  logger.info(`App running on the port ${listenPort}`);
});
