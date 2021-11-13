var icons = require("react-icons");

function injectRouteMW (app) {
    app.get("/icon", function (req, res) {
        res.send("Retuning icon");
    })
    
    app.get("/image", function (req, res) {
        res.send("Returning image!");
    })
    app.get("/doc", function (req, res) {
        res.send("Returning doc")
    })
}

module.exports = injectRouteMW;