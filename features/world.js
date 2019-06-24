const { setWorldConstructor, Before, After } = require("cucumber");
const axios = require("axios");
const createApp = require("../src/app");
const config = require("config")
const { Pool } = require('pg')
const db = new Pool(config.postgres);
const users = require("../src/users/repository")(db);
const forms = require("../src/forms/repository")(db);
const huts = require("../src/huts/repository")(db);
const app = createApp(5444, { db, users, forms, huts });

function World() {
    process.env.NODE_ENV = "test";
}

setWorldConstructor(World);

Before(async function(testcase) {
    this.client = axios.create({
        baseURL: "http://localhost:5444"
    });

    await app.start();
});

After(async function(testcase) {
    await app.stop();
});

