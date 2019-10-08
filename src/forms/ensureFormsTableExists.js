const tableExists = require("../repositoryUtils/tableExists");

module.exports = async function ensureFormsTableExists(db) {
    if(await tableExists(db, "forms")) {
        return;
    }

    try {
        await db.query(
            `CREATE TABLE forms(
                id uuid UNIQUE PRIMARY KEY,
                hutId uuid UNIQUE,
                data json NOT NULL
            )`
        );
    } catch(error) {
        throw new Error("Something went wrong upon creating the forms table: ", error);
    }
}
