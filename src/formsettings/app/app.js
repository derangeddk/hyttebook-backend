const express = require("express");
const getFormsettingEndpoint = require("./get/endpoint");
const updateFormsettingEndpoint = require("./update/endpoint");

module.exports = (formsettings) => {
    let app = express();

    app.get("/", getFormsettingEndpoint(formsettings));
    app.put("/", updateFormsettingEndpoint(formsettings));

    return app;
};
