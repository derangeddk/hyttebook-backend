const express = require('express');
const updateFormEndpoint = require('./update/endpoint');
const getFormEndpoint = require("./get/endpoint");

module.exports = (formsRepository) => {
    let app = express();
    app.put('/:id', updateFormEndpoint(formsRepository));
    app.get('/:id', getFormEndpoint(formsRepository));

    return app;
};
