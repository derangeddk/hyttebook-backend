const express = require('express');
const createFormEndpoint = require('./create/endpoint')

module.exports = (forms) => {
    let app = express();
    app.post('/', createFormEndpoint(forms));

    return app;
};