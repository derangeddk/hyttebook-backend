const ensureFormsTableExists = require("../../src/forms/ensureFormsTableExists");

module.exports = function constructor(db) {
    return {
        initialize: async () => ensureFormsTableExists(db),
    };
};
