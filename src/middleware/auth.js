let jwt = require("./jwt");

module.exports = async (req, res, next) => {
    let token = req.cookies["access_token"];
    console.log(token);
    let tokenVerification = jwt.verify(token);
    if (!token) return res.sendStatus(403);
    req.auth = { token };
    next();
};
