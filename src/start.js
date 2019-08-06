const createApp = require("./app");
const config = require("config");
const smacker = require('smacker');

let app = createApp(config);
smacker.start({ service: app });
