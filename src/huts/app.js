const express = require('express');
const createHutsEndpoint = require('./create/endpoint');

module.exports = (huts) => {
    let app = express();
    app.post("/", createHutsEndpoint(huts));

    return app;
};
