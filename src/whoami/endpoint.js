module.exports = (users) => async (req, res) => {
    let userId = req.auth.user_id;

    let user;
    try{
        user =  await users.find(userId);
    } catch(error) {
        if(error.code) {
            if(error.code == "NON-EXISTENT") {
                res.status(204);
                return;
            }
        }
        res.status(500).json({message: "whoami failed"});
        return;
    }

    res.setHeader("Content-Type", "application/json");

    res.send({ user });
};
