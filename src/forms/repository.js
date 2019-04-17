module.exports = (db) => {
    ensureFormsTableExists(db);
    return {
        create: ( ) => createForm(db)
    };
};

function ensureFormsTableExists(db) {
    return true;
}

function createForm(db) {
    return true;
}