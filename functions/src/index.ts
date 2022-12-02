import * as functions from "firebase-functions";
import app from "./initializer";

export const armoryStaticApp = functions.https.onRequest(app);
// export const newApp = functions.https.onRequest(app);