const express = require('express');
const createFormEndpoint = require('./create/endpoint')

module.exports = (formsRepository) => {
    let app = express();
    app.post('/', createFormEndpoint(formsRepository));

    return app;
};
