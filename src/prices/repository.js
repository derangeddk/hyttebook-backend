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
        },
        create: (priceData) => createPrice(db, priceData),
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
        data: result.rows[0].data
        // monday: result.rows[0].data.monday,
        // tuesday: result.rows[0].data.tuesday,
        // wednesday: result.rows[0].data.wednesday,
        // thursday: result.rows[0].data.thursday,
        // friday: result.rows[0].data.friday,
        // saturday: result.rows[0].data.saturday,
        // sunday: result.rows[0].data.sunday
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

    return;
};
