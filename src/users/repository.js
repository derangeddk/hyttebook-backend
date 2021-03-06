const uuid = require('uuid');
const passwordEncryption = require("./passwordEncryption");
const tableExists = require("../repositoryUtils/tableExists");

module.exports = function constructor(db) {
    return {
        initialize: async () => await ensureUsersTableExists(db),
        create: (username, password, email, fullName) => createUser(db, username, password, email, fullName),
        authenticate: (username, password) =>  authenticate(db, username, password),
        find: (userId) => findById(db, userId)
    };
};

async function ensureUsersTableExists(db) {
    if (await tableExists(db, "users")){
        return;
    }

    try{
        await db.query(
            `CREATE TABLE users(
                id uuid PRIMARY KEY,
                username text UNIQUE NOT NULL,
                email text UNIQUE NOT NULL,
                passwordHash text NOT NULL,
                salt text NOT NULL,
                data json NOT NULL
            )`
        );

        await createUser(db, "admin","admin", "philip@deranged.dk", "admin");

    } catch(error) {
        console.error("Something went wrong upon creating the users table", error);
        process.exit(1);
    }
}

async function createUser(db, username, password, email, fullName) {
    let id = uuid.v4();
    let now = (new Date()).toISOString();
    let salt = passwordEncryption.getSalt(24);
    let passwordHash = passwordEncryption.hashPassword(password, salt);

    try {
        await db.query(
            `INSERT INTO users (
                id,
                username,
                email,
                passwordHash,
                salt,
                data
            )
            VALUES (
                $1::uuid,
                $2::text,
                $3::text,
                $4::text,
                $5::text,
                $6::json
            )`,
            [
                id,
                username,
                email,
                passwordHash,
                salt,
                {
                    createdAt: now,
                    updatedAt: now,
                    username,
                    email,
                    fullName
                }
            ]
        );
    } catch(error) {
        if(error.constraint == 'users_username_key') {
            throw {
                code: "DUPLICATE",
                trace: new Error("users_username_key contraint error"),
                field: "username",
                error
            };
        }
        if(error.constraint == 'users_email_key') {
            throw {
                code: "DUPLICATE",
                trace: new Error("users_email_key constraint error"),
                field: "email",
                error
            };
        }
        throw error;
    }

    let user = {
        id,
        username
    }

    return user;
}

async function authenticate(db, email, password) {
    let result;
    try{
        result = await db.query(
            `SELECT
                id,
                passwordHash,
                salt,
                username
             FROM users
             WHERE email = $1::text
             `,
             [
                 email
             ]
        );
    } catch(error) {
        console.error("could not authenticate the user. This was the error: ", error);
    }


    if(result.rows.length != 1) {
        let error = new Error("Couldn't find a user with that email");
        error.code = "NON-EXISTENT";
        throw error;
    }

    if(!passwordEncryption.hashedPasswordAndTypedPasswordMatch(result.rows[0].salt, result.rows[0].passwordhash, password)){
        let error = new Error("The password was incorrect")
        error.code = "INCORRECT";
        throw error;
    }

    let user = {
        id: result.rows[0].id,
        username: result.rows[0].username
    };

    return user;
}

async function findById(db, userId) {
    let queryResult;
    try {
        queryResult = await db.query(
            `SELECT username FROM users
            WHERE id = $1::uuid`,
            [
                userId
            ]
        )
    } catch(error) {
        console.error("error while trying to find user by id: " ,error);
        throw new Error("users repository failed to find a user by id: ", error);
    }

    if(queryResult.rows.length != 1) {
        let error = new Error("Couldn't find a user with that id");
        error.code = "NON-EXISTENT";
        throw error;
    }

    let user = {
        username: queryResult.rows[0].username
    };

    return user;
}
