const uuid = require('uuid');

module.exports = (db) => {
    //TODO: ensure users table exists

    return {
        create: async (username, password) => {
            let id = uuid.v4();
            let now = (new Date()).toISOString();
            let passwordHash = 1;
            let salt = 1;
            await db.query("INSERT INTO users (id, username, passwordHash, salt, data) VALUES ($1::uuid, $2::text, $3::text, $4::text, $5::json", [
                id, username, passwordHash, salt, { createdAt: now, updatedAt: now }
            ]);

            return { id, username };
        },
    };
};