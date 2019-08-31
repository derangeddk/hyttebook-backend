module.exports = (users) => async (req, res) => {
    let { email, password } = req.body;

    let result;

    try{
        result =  await users.authenticate(email, password);
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

    delete user.id

    let { token, user } = result;

    res.send({token, user});
};
