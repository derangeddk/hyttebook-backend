const express = require("express");
const getRoleConnectionEndpoint = require("./get/endpoint");

module.exports = (roleConections) => {
    let app = express();
    app.head("/", getRoleConnectionEndpoint(roleConections));

    return app;
};