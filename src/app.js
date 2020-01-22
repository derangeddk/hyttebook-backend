const express = require("express");
const fs = require("fs");
const path = require("path");
const dummyScript = fs.readFileSync(path.join(__dirname, "dummyScript.js"), "utf8");
const usersApp = require("./users/app");
const bodyParser = require("body-parser");
const whoAmIEndpoint = require("./whoami/endpoint");
const loginEndpoint = require('./login/endpoint');
const logoutEndpoint = require("./logout/endpoint");
const formsApp = require('./forms/app');
const hutsApp = require('./huts/app');
const { promisify } = require('util');
const { Pool } = require('pg')
const UsersRepository = require("./users/repository");
const FormsRepository = require('./forms/repository');
const HutsRepository = require('./huts/repository');
const cors = require("cors");
let cookieParser = require('cookie-parser');
const auth = require("./middleware/auth");

module.exports = (config) => {
    let app = express();
    app.use(bodyParser.json());
    app.use(cookieParser());

    let whiteList = ["http://localhost:4752", "http://localhost:3000", " http://dawa.aws.dk/postnumre/"];
    let corsOptions = {
        origin: function(origin, callback) {
            if(whiteList.indexOf(origin) !== -1 || !origin) {
                callback(null, true);
            } else {
                callback(new Error("not allowedby CORS"));
            }
        },
        credentials: true,
        allowedHeaders: "Origin, X-Requested-With, Content-Type, Accept"
    };
    app.use(cors(corsOptions));


    app.get("/includes/:id/booking.js", (req, res) => {
        res.set("Content-Type", "application/javascript");
        res.send(dummyScript);
    });

    const db = new Pool(config.postgres);
    let usersRepository = new UsersRepository(db);
    let formsRepository = new FormsRepository(db);
    let hutsRepository = new HutsRepository(db, formsRepository);

    app.post("/login", loginEndpoint(usersRepository));
    app.use("/users", usersApp(usersRepository));
    //From now on users should be authenticated
    app.use(auth);
    app.get("/whoami", whoAmIEndpoint(usersRepository));
    app.post("/logout", logoutEndpoint);
    app.use("/forms", formsApp(formsRepository));
    app.use("/huts", hutsApp(hutsRepository));

    let server;
    return {
        start: async () => {
            //assert db start readiness
            let retries = 5;
            while(retries) {
                try {
                    await db.query("SELECT now();")
                    break;
                } catch(error) {
                    console.log("error connecting to database on application initilization: ", error);
                    retries--;
                    await new Promise(res => setTimeout(res, 5000));
                }
            }
            await usersRepository.initialize();
            await formsRepository.initialize();
            await hutsRepository.initialize();

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
