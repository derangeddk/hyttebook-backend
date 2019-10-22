module.exports = async (db, tableName) => {
    try {
        await db.query(
            `SELECT 'public.${tableName}'::regclass`
        );
    } catch(error) {
        if(error.message === `relation "public.${tableName}" does not exist`) {
            return false;
        }
        console.error(error);
        throw new Error(`Tried to assertain the existence of a '${tableName}' table:`, error);
    }
    return true;
}
