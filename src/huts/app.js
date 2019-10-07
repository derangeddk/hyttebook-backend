const express = require('express');
const createHutsEndpoint = require('./create/endpoint');
const getHutsEndpoint = require('./get/endpoint');
const listHutsEndpoint = require("./list/endpoint");

module.exports = (hutsRepository) => {
    let app = express();
    app.post("/", createHutsEndpoint(hutsRepository));
    app.get("/:id", getHutsEndpoint(hutsRepository));
    app.get("/", listHutsEndpoint(hutsRepository))

    return app;
};
