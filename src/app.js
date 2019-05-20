const express = require("express");
const fs = require("fs");
const path = require("path");
const dummyScript = fs.readFileSync(path.join(__dirname, "dummyScript.js"), "utf8");
const usersApp = require("./users/app");
const bodyParser = require("body-parser");
const loginEndpoint = require('./login/endpoint');
const formsApp = require('./forms/app');
const hutsApp = require('./huts/app');

module.exports = (port, repos) => {
    let { users, forms, huts } = repos;
    let app = express();
    app.use(bodyParser.json());
    app.use(function(req, res, next) {
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        next();
      });

    app.get("/includes/:id/booking.js", (req, res) => {
        res.set("Content-Type", "application/javascript");
        res.send(dummyScript);
    });

    app.post("/login", loginEndpoint(users));

    app.use("/users", usersApp(users));
    app.use("/forms", formsApp(forms));
    app.use("/huts", hutsApp(huts));


    return {
        start: () => new Promise((resolve, reject) => {
            app.listen(port, (error) => {
                if(error) {
                    return reject(error);
                }
                console.log("Running server on port " + port);
                resolve();
            });
        })
    };
};
