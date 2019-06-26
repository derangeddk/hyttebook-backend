const ensureFormsTableExists = require("../../src/forms/ensureFormsTableExists");

module.exports = function constructor(db) {
    return {
        initialize: async () => ensureFormsTableExists(db),
        find: (hutId) => findForm(db, hutId),
    };
};

async function findForm(db, hutId) {
    let result;
    try {
        result = await db.query(`SELECT * FROM forms
            WHERE id = '${hutId}'`
        );
    } catch(error) {
        throw new Error(`queried for a form with an id of ${hutId}`);
    }
}
