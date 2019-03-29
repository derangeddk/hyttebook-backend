const createApp = require("./app");
const config = require("config");
const { Pool } = require('pg')
const db = new Pool(config.postgres);
const users = require("./users/repository")(db);


(async function() {
    let app = createApp(config.port, users);

    await app.start();
})();

