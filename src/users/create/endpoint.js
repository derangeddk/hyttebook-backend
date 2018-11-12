module.exports = (users) => async (req, res) => {
    let { username, password } = req.body;

    if(!username) {
        // ...
    }

    if(!password) {
        // ...
    }

    let user = await users.create(username, password);
    res.send(user);
};
