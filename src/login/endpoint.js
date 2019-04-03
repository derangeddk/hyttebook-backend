module.exports = (users) => async (req, res) => {
    let { username, password } = req.body;

    let { token, user } =  await users.authenticate(username, password);

    res.send({token, user});
};