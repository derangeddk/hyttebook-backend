module.exports = (users, formsettings) => async (req, res) => {
    let { username, password } = req.body;

    if(!username) {
        // ...
    }

    if(!password) {
        // ...
    }

    let user = await users.create(username, password);
    await formsettings.create(user.id);
    res.send(user);
};
