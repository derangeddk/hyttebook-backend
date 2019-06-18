const uuid = require('uuid');

module.exports = async (db) => {
    await ensureHutsTableExists(db);
    return {
        create: (hutData) => createHut(db, hutData)
    };
};

async function ensureHutsTableExists(db) {
    if(await tableExists(db)) {
        return;
    }
    try {
        await db.query("CREATE TABLE huts(id uuid UNIQUE PRIMARY KEY, data json NOT NULL)");
    } catch(error) {
        throw new Error("failed while trying to create 'huts' table", error);
    }
}

async function tableExists(db) {
    try {
        await db.query(
            `SELECT 'public.huts'::regclass`
        );
    } catch(error) {
        if(error.message === 'relation "public.huts" does not exist') {
            return false;
        }
        throw new Error("Tried to assertain the existence of a 'huts'", error);
    }
    return true;
}

async function createHut(db, hutData) {
    let id = uuid.v4();
    let now = (new Date()).toISOString();

    try {
        await db.query(
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
                    createdAt: now,
                    updatedAt: now,
                    ...hutData
                }
            ]
        )
    } catch(error) {
        console.error("failed to insert hut", error);
        return;
    }
    return id;
}
