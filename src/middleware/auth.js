let jwt = require("./jwt");

module.exports = async (req, res, next) => {
    let token = req.cookies["access_token"];
    if (!token) return res.sendStatus(401);
    req.auth = { token };
    next();
};
