const express = require("express");
const getFormEndpoint = require("./get/endpoint");

module.exports = (formSettingsRespository) => {
    let app = express();
    app.get("/:id", getFormEndpoint(formSettingsRespository));

    return app;
};
