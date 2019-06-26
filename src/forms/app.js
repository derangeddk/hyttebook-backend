const express = require('express');
const createFormEndpoint = require('./create/endpoint');
const getFormEndpoint = require("./get/endpoint");

module.exports = (formsRepository) => {
    let app = express();
    app.post('/', createFormEndpoint(formsRepository));
    app.get('/:id', getFormEndpoint(formsRepository));

    return app;
};
