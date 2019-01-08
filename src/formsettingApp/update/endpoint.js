module.exports = (formsettings) => async (req, res) => {
    let {user, data} = req.data;
    if (!validate(data)) {
        res.send({error: "formsettings not valid"});
    }

    let response = await formsettings.set(user.id, data);

    res.send("formsettings updated");
}

function validate(data) {
    // ensure only valid formsettings
    validate.keys.forEach(key => {
        if (allFormsettings.indexOf(key) == -1) {
            return false;
        }
    });
    // TODO ensure valid values of each config
    return true;
}

// TODO, where to put this list of formsettings 
const allFormsettings = ["name", "id", "something"];