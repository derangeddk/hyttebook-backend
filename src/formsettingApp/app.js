const express = require("express");
const createFormsettingsEndpoint = require("./create/endpoint");
const getFormsettingEndpoint = require("./get/endpoint");
const updateFormsettingEndpoint = require("./update/endpoint");

module.exports = (formsettings) => {
    let app = express();

    app.post("/", createFormsettingsEndpoint(formsettings));
    app.get("/", getFormsettingEndpoint(formsettings));
    app.put("/", updateFormsettingEndpoint(formsettings));

    return app;
};
