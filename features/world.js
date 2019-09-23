const { setWorldConstructor, Before, After } = require("cucumber");
const axios = require("axios");
const createApp = require("../src/app");
const config = require("config")
//change host of db because it is not running in docker in this test.
//Might need to changed when testing inside of containers!
config.postgres.host = "localhost";
//Change port because the the running dockerized app uses 4752
config.port = 4751;
const app = createApp(config);

function World() {
    process.env.NODE_ENV = "test";
}

setWorldConstructor(World);

Before(async function(testcase) {
    this.client = axios.create({
        baseURL: `http://localhost:${config.port}`,
    });

    this.setUser = (token) => {
        this.client = axios.create({
            baseURL: `http://localhost:${config.port}`,
            headers:{
                'Content-type': 'application/json',
                'access_token': `${token}`,
            }
        });
    };

    await app.start();
});

After(async function(testcase) {
    await app.stop();
});

