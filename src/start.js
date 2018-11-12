const createApp = require("./app");
const config = require("config");

(async function() {
    let app = createApp(config.port);

    await app.start();
})();
