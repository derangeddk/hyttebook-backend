const uuid = require('uuid');
const crypto = require('crypto');

module.exports = (db) => {
    ensureUsersTableExists(db);

    return {
        create: (username, password, email, fullName) => createUser(db, username, password, email, fullName),
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
                email text UNIQUE NOT NULL,
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
    try {
        await db.query(
            `SELECT 'public.users'::regclass`
        );
    } catch(error) {
        console.error('No users table was found. An attempt at creating one will now proceed. This was the error: ', error);
        return false;
    }

    return true;
}


async function createUser(db, username, password, email, fullName) {
    let id = uuid.v4();
    let now = (new Date()).toISOString();
    let salt = getSalt(16);
    let passwordHash = hashPassword(password, salt);

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
            let error = new Error("A user with that username already exists");
            error.code = "DUPLICATE";
            throw error;
        }
        if(error.constraint == 'users_email_key') {
            let error = new Error("A user with that email already exists");
            error.code = "DUPLICATE";
            throw error;
        }
        if(error.constraint == 'users_pkey') {
            let error = new Error("A user with that id already exists");
            error.code = "DUPLICATE";
            throw error;
        }
    }

    return { id, username, email };
}

async function authenticate(db, email, password) {
    let result;
    try{
        result = await db.query(
            `SELECT
                id,
                passwordHash,
                salt,
                data
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


    if(!hashedPasswordAndTypedPasswordMatch(result.rows[0].salt, result.rows[0].passwordhash, password)){
        let error = new Error("The password was incorrect")
        error.code = "INCORRECT";
        throw error;
    }

    return { token: 1, user: result.rows[0].data };
}

function getSalt(saltLength) {
    return crypto.randomBytes(Math.ceil(saltLength/2)).toString('hex').slice(0,saltLength);
};

function hashPassword(password, salt) {
    let hash = crypto.createHmac('sha512', salt);
    hash.update(password);
    return hash.digest('hex');
}

function hashedPasswordAndTypedPasswordMatch(salt, passwordHash, clearTextPassword) {
    let hashedClearTextPassword = hashPassword(clearTextPassword, salt);

    return hashedClearTextPassword === passwordHash ? true : false;
}
