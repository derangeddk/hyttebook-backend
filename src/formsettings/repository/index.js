module.exports = (db) => {
    ensureFormsettingsDbExists(db);

    return {
        get: (userId) => getFormsetting(db, userId),
        set: (requestBody, userId) => updateFormsetting(db, userId, requestBody),
        create: (userId) => createFormsetting(db, userId)
    }
}

function getFormsetting(db, userId) {
    return new Promise((resolve, reject) => {
        db.query("SELECT * FROM form_settings WHERE id = $1::uuid", [ userId ], (error, result) => {
            if(error) {
                return reject( {
                    trace: new Error("Failed to get form setting from database"),
                    userId,
                    error: error.stack
                });
            }
            if(result.rows.length == 0) {
                return reject({
                    type: "FormsettingNotFound",
                    trace: new Error("Someone requested to get a purchase that does not exist."),
                    error: error.stack,
                    userId
                });
            }
            var formsetting = result.rows[0];
            resolve(formsetting);
        });
    });
}

function createFormsetting(db, userId) {
    let data = getDefaultFormsettings();
    return new Promise((resolve, reject) => {
        db.query("INSERT INTO form_settings(id, data) VALUES($1::uuid, $2::json)", [userId, data], (error, result) => {
            if(error) {
                return reject( {
                    type: FormsettingNotCreated,
                    trace: new Error("Failed to create formsetting"),
                    error: error.stack,
                    userId
                })
            }
        }
    };
}

// TODO atm the whole data obj gets overwritten, enable that a single field(s) can be updated
function updateFormsetting(db, userId, data) {
    return new Promise((resolve, reject) => {
        db.query("UPDATE form_settings SET data = $1::json WHERE id = $2::uuid", [data, userId], (error, result) => {
            if(error) {
                return reject( {
                    // type: "FormsettingNotUpdated",
                    trace: new Error("Failed to update formsetting."),
                    error : error.stack,
                    userId
                });
            }

        });
    });
}

function ensureFormsettingsDbExists(db) {
    db.query("CREATE TABLE IF NOT EXISTS form_settings (id uuid NOT NULL, data json NOT NULL", (error) => {
        if(error) {
            console.error("Failed to ensure formsetting database. May see erratic behaviour.", error);
        }
    });
}

function getDefaultFormsettings() {
    return {
        cleaning : true
    }
}