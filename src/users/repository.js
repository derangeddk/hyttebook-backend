const uuid = require('uuid');

module.exports = (db) => {
    ensureUsersTableExists(db);

    return {
        create: (username, password, email, hutName, fullName) => createUser(db, username, password, email, hutName, fullName),
        authenticate: (username, password) =>  authenticate(db, username, password),
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


async function createUser(db, username, password, email, hutName, fullName) {
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
                updatedAt: now,
                username,
                email,
                hutName,
                fullName
            }
        ]
    );

    return { id, username };
}

async function authenticate(db, username, password) {
    let result = await db.query(
        `SELECT
            id,
            passwordHash,
            salt,
            data
         FROM users
         WHERE username = $1::text
         `,
         [
             username
         ]
    );

    if(result.rows.length != 1) {
        throw new Error("Couldn't find a user");
    }

    return { token: 1, user: result.rows[0] };
}