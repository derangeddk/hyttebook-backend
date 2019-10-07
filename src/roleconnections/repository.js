module.exports = function constructor(db) {
    return {
        initialize: async () => {
            await ensureRoleConnectionsTableExists(db);
        }
    };
};

async function ensureRoleConnectionsTableExists(db) {
    if(await roleConnectionsTableExists(db)) {
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

async function roleConnectionsTableExists(db) {
    try {
        await db.query(
            "SELECT 'public.role_connections'::regclass"
        );
    } catch(error) {
        if(error.message === 'relation "public.role_connections" does not exist') {
            return false;
        }
        throw new Error("Unable to assertain the existence of a 'role_connections' table", error);
    }
    return true;
};
