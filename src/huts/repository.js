const uuid = require('uuid');

module.exports = function constructor(db) {
    return {
        initialize: async () => {
            await ensureHutsTableExists(db);
            await ensureRoleConnectionsTableExists(db);
        },
        create: (hut, userId) => createHutWithImplicitFormAndAdmin(db, hut, userId),
        find: (hutId) => findHut(db, hutId),
    };
};

async function findHut(db, hutId) {
    let result;
    try {
        result = await db.query(
            `SELECT * FROM huts
                WHERE id = '${hutId}'`
        )
    } catch(error) {
        throw new Error("tried to find a hut", error);
    }

    let hut = {
        id: result.rows[0].id,
        hutName: result.rows[0].data.hutName,
        street: result.rows[0].data.street,
        streetNumber: result.rows[0].data.streetNumber,
        city: result.rows[0].data.city,
        zipCode: result.rows[0].data.zipCode,
        email: result.rows[0].data.email,
        phone: result.rows[0].data.phone
    }

    return hut;
};

async function createHutWithImplicitFormAndAdmin(db, hut, userId) {
    let hutId = uuid.v4();

    await createHut(db, hut, hutId);
    await createImplicitForm(db, hutId);
    await makeCreatingUserAdministrator(db, hutId, userId);

    return hutId;
};

async function createHut(db, hut, hutId) {
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
                hutId,
                {
                    createdAt: now,
                    updatedAt: now,
                    ...hut
                }
            ]
        )
    } catch(error) {
        throw new Error("tried to insert a new hut into 'huts' tabel", error);
    }

    return;
};

async function createImplicitForm(db, hutId) {
    let id = uuid.v4();
    let now = (new Date()).toISOString();

    let formConfigs=  {
        showOrgType: false,
        showBankDetails: false,
        showEan: false,
        showCleaningToggle: false,
        defaultCleaningInclude: false,
        showArrivalTime: false,
        showDepartureTime: false,
        stdArrivalTime: false,
        stdDepartureTime: false,
        stdInformation: ""
    };

    try {
        await db.query(
            `INSERT INTO forms(
                id,
                hutId,
                data
            )
            VALUES(
                $1::uuid,
                $2::uuid,
                $3::json
            )`,
            [
                id,
                hutId,
                {
                    createdAt: now,
                    updatedAt: now,
                    ...formConfigs
                }
            ]
        );
    } catch(error) {
        throw new Error("failed to insert form", error);
    }

    return;
};

async function makeCreatingUserAdministrator(db, hutId, userId) {
    let role = 1;

    try {
        await db.query(
            `INSERT INTO role_connections(
                user_id,
                hut_id,
                role
            )
            VALUES(
                $1::uuid,
                $2::uuid,
                $3::integer
            )`,
            [
                userId,
                hutId,
                role
            ]
        );
    } catch(error) {
        throw new Error("failed to insert roleConnection into role_connections");
    }

    return;
};

async function ensureRoleConnectionsTableExists(db) {
    if(await roleConnectionsTableExists(db)) {
        return;
    }

    try {
        await db.query(
            `CREATE TABLE role_connections(
                user_id uuid NOT NULL,
                hut_id uuid NOT NULL,
                role integer NOT NULL
            )`
        );
    } catch(error) {
        throw new Error("failed to create 'role_connections' table", error);
    }
};

async function ensureHutsTableExists(db) {
    if(await hutsTableExists(db)) {
        return;
    }
    try {
        await db.query("CREATE TABLE huts(id uuid UNIQUE PRIMARY KEY, data json NOT NULL)");
    } catch(error) {
        throw new Error("failed while trying to create 'huts' table", error);
    }
};

async function roleConnectionsTableExists(db) {
    try {
        await db.query(
            `SELECT 'public.role_connections'::regclass`
        );
    } catch(error) {
        if(error.message === 'relation "public.role_connections" does not exist') {
            return false;
        }
        throw new Error("Tried to assertain the existence of a 'role_connections' table", error);
    }
    return true;
};

async function hutsTableExists(db) {
    try {
        await db.query(
            `SELECT 'public.huts'::regclass`
        );
    } catch(error) {
        if(error.message === 'relation "public.huts" does not exist') {
            return false;
        }
        throw new Error("Tried to assertain the existence of a 'huts' table", error);
    }
    return true;
};
