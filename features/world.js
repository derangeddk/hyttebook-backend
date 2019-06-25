const { setWorldConstructor, Before, After } = require("cucumber");
const axios = require("axios");
const createApp = require("../src/app");
const config = require("config")
const app = createApp(config);

function World() {
    process.env.NODE_ENV = "test";
}

setWorldConstructor(World);

Before(async function(testcase) {
    this.client = axios.create({
        baseURL: `http://localhost:${config.port}`
    });

    await app.start();
});

After(async function(testcase) {
    await app.stop();
});

