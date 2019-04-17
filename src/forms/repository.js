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
                configuration json NOT NULL
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

function createForm(db, formConfigs) {
    return true;
}