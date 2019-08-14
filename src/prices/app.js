const express = require('express');
const createPriceEndpoint = require('./create/endpoint');

module.exports = ( /* priesRepository */ ) => {
    let app = express();
    app.post("/", createPriceEndpoint(/* priesRepository */));

    return app;
};
