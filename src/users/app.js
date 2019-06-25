const express = require("express");
const createUserEndpoint = require("./create/endpoint");

module.exports = (usersRepository) => {
    let app = express();
    app.post("/", createUserEndpoint(usersRepository));

    return app;
};
