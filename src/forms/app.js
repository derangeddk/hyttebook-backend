const express = require('express');
const putFormEndpoint = require('./put/endpoint');
const getFormEndpoint = require("./get/endpoint");

module.exports = (formsRepository) => {
    let app = express();
    app.put('/:id', putFormEndpoint(formsRepository));
    app.get('/:id', getFormEndpoint(formsRepository));

    return app;
};
