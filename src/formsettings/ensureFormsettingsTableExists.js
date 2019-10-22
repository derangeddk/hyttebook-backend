const tableExists = require("../repositoryUtils/tableExists");

module.exports = async function ensureformSettingsTableExists(db) {
    if(await tableExists(db, "formSettings")) {
        return;
    }

    try {
        await db.query(
            `CREATE TABLE formSettings(
                id uuid UNIQUE PRIMARY KEY,
                hutId uuid UNIQUE,
                data json NOT NULL
            )`
        );
    } catch(error) {
        throw new Error("Something went wrong upon creating the formSettings table: ", error);
    }
}
