module.exports = (users) => async (req, res) => {
    let userId = req.auth.user_id;

    let user;
    try{
        user =  await users.find(userId);
    } catch(error) {
        if(error.code) {
            if(!error.code) {
                res.status(500).json({message: "An error occured that you can't help. Please refresh and start over"});
                return;
            }
        }
    }

    res.setHeader("Content-Type", "application/json");

    res.send({ user });
};
