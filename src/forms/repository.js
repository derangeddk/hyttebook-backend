const uuid = require('uuid');
const ensureFormsTableExists = require("../../src/forms/ensureFormsTableExists");

module.exports = function constructor(db) {
    return {
        initialize: async () => await ensureFormsTableExists(db),
        find: (hutId) => findForm(db, hutId),
        update: (hutId, formConfigs) => updateForm(db, hutId, formConfigs),
        create: (hutId, formConfigs) => createForm(db, hutId, formConfigs)
    };
};

async function createForm(db, hutId, formConfigs) {
    let id = uuid.v4();
    let now = (new Date()).toISOString();

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

    return id;
};

async function updateForm(db, hutId, formConfigs) {
    try {
        await db.query(
            'UPDATE forms SET data = $1 WHERE hutId = $2',
            [formConfigs, hutId]
            );
    } catch(error) {
        console.log(error);
        throw new Error(`queried for a form with an id of ${hutId}`);
    }
    return;
}

async function findForm(db, hutId) {
    let result;
    try {
        result = await db.query(`SELECT * FROM forms
            WHERE hutId = '${hutId}'`
        );
    } catch(error) {
        throw new Error(`queried for a form with an id of ${hutId}`);
    }

    let form = {
        id: result.rows[0].id,
        hutId: result.rows[0].hutid,
        ...result.rows[0].data
    }

    return form;
}
