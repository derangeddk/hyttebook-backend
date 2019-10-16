const uuid = require('uuid');
const tableExists = require("../repositoryUtils/tableExists");

/**
 * Price {
 *     id:  uuid
 *     data {
 *         createdAt: ISO8601string
 *         updatedAt: ISO8601string
 *         mon: number
 *         tue: number
 *         wed: number
 *         thu: number
 *         fri: number
 *         sat: number
 *         sun: number
 *     }
 * }
 */
module.exports = function constructor(db) {
    return {
        initialize: async () => {
            await ensurePricesTableExists(db);
            //await ensureOffersConnectionsTableExists(db);
            //await ensureSeasonsConnectionsTableExists
        },
        create: (priceData /* hutId ?? */) => createPrice(db, priceData),
        find: (priceId) => findPrice(db, priceId),
    };
};

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

async function createPrice(db, priceData) {
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
                    ...priceData
                }
            ]
        )
    } catch(error) {
        throw new Error("tried to insert a new price into 'prices' tabel", error);
    }

    // CREATE PRICE CONNECTION ?? :
    //
    // let priceConnection = { 
    //     userId,
    //     hutId: id,
    //     role: 1
    // };

    // try{
    //     await createPriceConnection(db, priceConnection);
    // } catch(error) {
    //     throw new Error("failed to implicitly create priceConnection after creating a price and a form", error);
    // }

    return id;
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
        mon: result.rows[0].data.mon,
        tue: result.rows[0].data.tue,
        wed: result.rows[0].data.wed,
        thu: result.rows[0].data.thu,
        fri: result.rows[0].data.fri,
        sat: result.rows[0].data.sat,
        sun: result.rows[0].data.sun
    }

    return price;
};





// async function ensureOffersTableExists(db) {
//     if(await tableExists(db)) {
//         return;
//     }
//     try {
//         await db.query("CREATE TABLE huts(id uuid UNIQUE PRIMARY KEY, data json NOT NULL)");
//     } catch(error) {
//         throw new Error("failed while trying to create 'huts' table", error);
//     }
// };

// async function ensureSeasonsTableExists(db) {
//     if(await tableExists(db)) {
//         return;
//     }
//     try {
//         await db.query("CREATE TABLE huts(id uuid UNIQUE PRIMARY KEY, data json NOT NULL)");
//     } catch(error) {
//         throw new Error("failed while trying to create 'huts' table", error);
//     }
// };


// async function createRoleConnection(db, roleConnection) {
//     let { userId, hutId, role } = roleConnection;

//     try {
//         await db.query(
//             `INSERT INTO role_connections(
//                 user_id,
//                 hut_id,
//                 role
//             )
//             VALUES(
//                 $1::uuid,
//                 $2::uuid,
//                 $3::integer
//             )`,
//             [
//                 userId,
//                 hutId,
//                 role
//             ]
//         );
//     } catch(error) {
//         throw new Error("failed to insert roleConnection into role_connections");
//     }

//     return;
// };
