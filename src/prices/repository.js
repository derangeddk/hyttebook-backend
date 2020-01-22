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
        find: (priceId) => findHutDayPrices(db, priceId),
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

async function findHutDayPrices(db, priceId) {
    let result;
    try {
        result = await db.query(
            `SELECT * FROM prices
                WHERE id = '${priceId}'`
        )
    } catch(error) {
        throw new Error("tried to find a price", error);
    }
    
    let { monday, tuesday, wednesday, thursday, friday, saturday, sunday } = result.rows[0];
    
    let dayPrices = {
        id: result.rows[0].id,
        data: { monday, tuesday, wednesday, thursday, friday, saturday, sunday }
    }

    return dayPrices;
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
        );
    } catch(error) {
        throw new Error("failed to insert a new price into 'prices' table");
    }
    return id;
};
