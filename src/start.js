const createApp = require("./app");
const config = require("config");
const Pool = require("pg-pool");
const db = new Pool(config.postgres);

(async function() {
    let app = createApp(config.port, db);

    await app.start();
})();
