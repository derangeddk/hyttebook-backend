const express = require("express");
const createUserEndpoint = require("./create/endpoint");

module.exports = (users) => {
    let app = express();
    app.post("/", createUserEndpoint(users));

    return app;
};
