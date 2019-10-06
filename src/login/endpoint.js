const jwt = require("../middleware/jwt");

module.exports = (users) => async (req, res) => {
    let { email, password } = req.body;

    let user;
    try{
        user =  await users.authenticate(email, password);
    } catch(error) {
        if(error.code) {
            if(error.code) {
                res.status(406).json({
                    code: error.code,
                    message: error.message
                });
                return;
            }
            if(!error.code) {
                res.status(500).json({message: "An error occured that you can't help. Please refresh and start over"});
            }
        }
    }

    let token = jwt.sign(user.id);
    delete user.id;

    res.cookie("access_token", token, { httpOnly: true, domain: "localhost" });
    res.setHeader("Content-Type", "application/json");
    res.send({ user });
};
