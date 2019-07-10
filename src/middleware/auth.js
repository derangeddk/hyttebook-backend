module.exports = async (req, res, next) => {
    let userId = req.headers["user-id"];
    if (!userId) return res.sendStatus(401);
    req.auth = { userId };
    next();
};
