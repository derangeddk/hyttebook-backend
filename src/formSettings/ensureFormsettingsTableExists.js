const tableExists = require("../repositoryUtils/tableExists");

module.exports = async function ensureformSettingsTableExists(db) {
    if(await tableExists(db, "form_settings")) {
        return;
    }

    try {
        await db.query(
            `CREATE TABLE form_settings(
                id uuid UNIQUE PRIMARY KEY,
                hutId uuid UNIQUE,
                data json NOT NULL
            )`
        );
    } catch(error) {
        throw new Error("Something went wrong upon creating the form_settings table: ", error);
    }
}
