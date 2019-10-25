const express = require('express');
const updateFormEndpoint = require('./update/endpoint');
const getFormEndpoint = require("./get/endpoint");

module.exports = (formSettingsRepository) => {
    let app = express();
    app.put('/:id', updateFormEndpoint(formSettingsRepository));
    app.get('/:id', getFormEndpoint(formSettingsRepository));

    return app;
};
