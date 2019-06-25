const express = require("express");
const fs = require("fs");
const path = require("path");
const dummyScript = fs.readFileSync(path.join(__dirname, "dummyScript.js"), "utf8");
const usersApp = require("./users/app");
const bodyParser = require("body-parser");
const loginEndpoint = require('./login/endpoint');
const formsApp = require('./forms/app');
const hutsApp = require('./huts/app');
const { promisify } = require('util');
const { Pool } = require('pg')
const Users = require("./users/repository");
const Forms = require('./forms/repository');
const Huts = require('./huts/repository');

module.exports = (config) => {
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

    const db = new Pool(config.postgres);
    let users = new Users(db);
    let forms = new Forms(db);
    let huts = new Huts(db);
    app.post("/login", loginEndpoint(users));
    app.use("/users", usersApp(users));
    app.use("/forms", formsApp(forms));
    app.use("/huts", hutsApp(huts));

    let server;
    return {
        start: async () => {
            //assert db start readiness
            await db.query("SELECT now();")
            await users.initialize();
            await forms.initialize();
            await huts.initialize();

            const listen = promisify(callback => {
                server = app.listen(config.port, callback)
            });

            await listen();
            console.log("Running server on port " + config.port);
        },
        stop: async () => {
            let close = promisify(callback => server.close(callback));
            await close();
            console.log("server has been shut down");
            await db.end();
        }
    };
};
