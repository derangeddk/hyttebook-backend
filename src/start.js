const createApp = require("./app");
const config = require("config");
const { Pool } = require('pg')
const db = new Pool(config.postgres);
const users = require("./users/repository")(db);
const forms = require('./forms/repository')(db);
const huts = require('./huts/repository')(db);
const smacker = require('smacker');

let app = createApp(config.port, { db, users, forms, huts });
smacker.start({ service: app });


// (async function() {
//     let app = createApp(config.port, { db, users, forms, huts });
//     await app.start();
//     await app.stop();
// })();

