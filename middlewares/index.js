var injectLibMW = require("./lib-middlewares.js");
var injectRouteMW = require("./route-middlewares.js");

function injectMiddlewares (app) {
    injectLibMW(app);
    injectRouteMW(app);
}

module.exports = injectMiddlewares;