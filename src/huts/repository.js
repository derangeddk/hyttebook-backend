const uuid = require('uuid');
const tableExists = require("../repositoryUtils/tableExists");

module.exports = function constructor(db) {
    return {
        initialize: async () => {
            await ensureHutsTableExists(db);
            await ensureRoleConnectionsTableExists(db);
            await ensurePricesTableExists(db);
        },
        create: (hut, userId) => createHutWithImplicitFormAndAdmin(db, hut, userId),
        find: (hutId) => findHut(db, hutId),
    };
};

/*
Hut {
    id: uuid
    data: {
        createdAt: ISO8601string
        updatedAt: ISO8601string
        hutName: string
        street: string
        streetNumber: string
        city: string
        zipCode: string
        email: string
        phone: string
    }
}

Role {
    id: uuid
    hut_id: uuid
    role: int
}

Form {
    id: uuid
    hutId: uuid
    {
        createdAt: string,
        updatedAt: string,
        showOrgType: bool,
        showBankDetails: bool,
        showEan: bool,
        showCleaningToggle: bool,
        defaultCleaningInclude: bool,
        showArrivalTime: bool,
        showDepartureTime: bool,
        stdArrivalTime: bool,
        stdDepartureTime: bool,
        stdInformation: string
    }
} 

Price {
    id:  uuid
    data {
        createdAt: ISO8601string
        updatedAt: ISO8601string
        mon: number
        tue: number
        wed: number
        thu: number
        fri: number
        sat: number
        sun: number
    }
}

*/

async function findHut(db, hutId) {
    let result;
    let priceResult;
    try {
        result = await db.query(
            `SELECT * FROM huts
                WHERE id = '${hutId}'`
        )
        priceResult = findPrice(db, result.rows[0].data.priceId);
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
        phone: result.rows[0].data.phone,
        price: priceResult.data
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
        let priceId = await createPrice(db, hut.price);
        delete hut["price"];
        hut.priceId = priceId

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
    if(await tableExists(db, "role_connections")) {
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
    if(await tableExists(db, "huts")) {
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
        throw new Error("failed while trying to create 'huts' table", error);
    }
};



// PRICES
async function ensurePricesTableExists(db) {
    if(await tableExists(db, "prices")) {
        return;
    }

    try {
        await db.query(
            `CREATE TABLE prices(id uuid UNIQUE PRIMARY KEY, data json NOT NULL)`
        );
    } catch(error) {
        throw new Error("failed to create 'prices' table", error);
    }
};

async function findPrice(db, priceId) {
    let result;
    try {
        result = await db.query(
            `SELECT * FROM prices
                WHERE id = '${priceId}'`
        )
    } catch(error) {
        throw new Error("tried to find a price", error);
    }

    let price = {
        id: result.rows[0].id,
        data: {
            monday: result.rows[0].data.monday,
            tuesday: result.rows[0].data.tuesday,
            wednesday: result.rows[0].data.wednesday,
            thursday: result.rows[0].data.thursday,
            friday: result.rows[0].data.friday,
            saturday: result.rows[0].data.saturday,
            sunday: result.rows[0].data.sunday
        }
    }

    return price;
};

async function createPrice(db, hutPrice) {
    let id = uuid.v4();
    let now = (new Date()).toISOString();

    try {
        await db.query(
            `INSERT INTO prices(
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
                    ...hutPrice
                }
            ]
        );
    } catch(error) {
        throw new Error("failed to insert a new price into 'prices' table");
    }
    
    return id;
};
