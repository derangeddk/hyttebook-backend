module.exports = (req, res) => {
    if(!req.auth.user_id) {
        res.status(400);
        return;
    }

    res.clearCookie("access_token");
    res.status(204);
    res.send();
};
