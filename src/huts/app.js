const express = require('express');
const createHutsEndpoint = require('./create/endpoint');
const getHutsEndpoint = require('./get/endpoint');

module.exports = (hutsRepository) => {
    let app = express();
    app.post("/", createHutsEndpoint(hutsRepository));
    app.get("/:id", getHutsEndpoint(hutsRepository));

    return app;
};
