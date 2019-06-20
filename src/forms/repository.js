const uuid = require('uuid');
const ensureFormsTableExists = require("../../src/forms/ensureFormsTableExists");

module.exports = (db) => {
    ensureFormsTableExists(db);
};
