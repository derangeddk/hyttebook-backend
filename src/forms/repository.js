const uuid = require('uuid');

module.exports = (db) => {
    ensureFormsTableExists(db);
    return {
        create: (formConfigs) => createForm(db, formConfigs)
    };
};

async function ensureFormsTableExists(db) {
    if(await tableExists(db)) {
        return;
    }

    try {
        await db.query(
            `CREATE TABLE forms(
                id uuid UNIQUE PRIMARY KEY,
                data json NOT NULL
            )`
        );
    } catch(error) {
        console.error("Something went wrong upon creating the forms table: ", error);
        process.exit(1);
    }
}

async function tableExists(db) {
    try {
        await db.query(
            `SELECT 'public.forms'::regclass`
        );
    } catch(erro) {
        return false;
    }

    return true;
}

async function createForm(db, formConfigs) {
    let id = uuid.v4();
    let now = (new Date()).toISOString();
    let {
            showOrgType,
            showBankDetails,
            showEan,
            showCleaningToggle,
            defaultCleaningInclude,
            showArrivalTime,
            showDepartureTime,
            stdArrivalTime,
            stdDepartureTime,
            stdInformation
        } = formConfigs;

    try {
        await db.query(
            `INSERT INTO forms(
                id,
                data
            )
            VALUES(
                $1::uuid,
                $2::json
            )`,
            [
                id,
                {
                    createdAt: now,
                    update: now,
                    showOrgType,
                    showBankDetails,
                    showEan,
                    showCleaningToggle,
                    defaultCleaningInclude,
                    showArrivalTime,
                    showDepartureTime,
                    stdArrivalTime,
                    stdDepartureTime,
                    stdInformation
                }
            ]
        );
    } catch(error) {
        console.error("failed to insert form: ", error);
    }

    return { id, formConfigs };
}