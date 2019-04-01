const uuid = require('uuid');

module.exports = (db) => {
    ensureUsersTableExists(db);

    return {
        create: (username, password) => createUser(db, username, password),
    };
};

async function ensureUsersTableExists(db) {
    if (await tableExists(db)){
        return;
    }

    try{
        await db.query(
            `CREATE TABLE users(
                id uuid PRIMARY KEY,
                username text UNIQUE NOT NULL,
                passwordHash text NOT NULL,
                salt text NOT NULL,
                data json NOT NULL
            )`
        );

        await createUser(db, "admin","admin");

    } catch(error) {
        console.error("Something went wrong upon creating the users table", error);
        process.exit(1);
    }
}

async function tableExists(db) {
    let result = await db.query(
        `SELECT 'public.users'::regclass`
    )
    .then(() => {
        return true;
    })
    .catch(error => {
        return false;
    })

    return result;
}


async function createUser(db, username, password) {
    let id = uuid.v4();
    let now = (new Date()).toISOString();
    let passwordHash = 1;
    let salt = 1;
    await db.query(
        `INSERT INTO users (
            id,
            username,
            passwordHash,
            salt,
            data
            )
        VALUES (
            $1::uuid,
            $2::text,
            $3::text,
            $4::text,
            $5::json
        )`,
        [
            id,
            username,
            passwordHash,
            salt,
            {
                createdAt: now,
                updatedAt: now
            }
        ]
    )
    .catch((error) => {
        console.log("something went wrong upon inserting an admin user: ", error.message);
    });

    return { id, username };
}