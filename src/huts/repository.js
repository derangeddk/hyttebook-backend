const uuid = require('uuid');

module.exports = (db) => {
    ensureHutsTableExists(db);
    return {
        create: (hutData) => createHut(db, hutData)
    };
};

async function ensureHutsTableExists(db) {
    if(await tableExists(db)) {
        return;
    }

    try {
        await db.query(
            `CREATE TABLE huts(
                id uuid UNIQUE PRIMARY KEY,
                data json NOT NULL
            )`
        );
    } catch(error) {
        console.error("failed to create huts table", error);
        process.exit(1);
    }
}

async function tableExists(db) {
    try {
        await db.query(
            `SELECT 'public.huts'::regclass`
        );
    } catch(error) {
        return false;
    }

    return true;
}

async function createHut(db, hutData) {
    let id = uuid.v4();
    let now = (new Date()).toISOString();
    let {
        hutName,
        street,
        streetNumber,
        city,
        zipCode,
        email,
        phone
    } = hutData;

    let result;
    try {
        result = await db.query(
            `INSERT INTO huts(
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
                    createAt: now,
                    updateAt: now,
                    hutName,
                    street,
                    streetNumber,
                    city,
                    zipCode,
                    email,
                    phone
                }
            ]
        )
    } catch(error) {
        console.error("failed to insert hut", error);
        return;
    }

    return id;
}
