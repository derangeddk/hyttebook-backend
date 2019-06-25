const createApp = require("./app");
const config = require("config");
const smacker = require('smacker');

let app = createApp(config);
smacker.start({ service: app });


// (async function() {
//     let app = createApp(config.port, { db, users, forms, huts });
//     await app.start();
//     await app.stop();
// })();

