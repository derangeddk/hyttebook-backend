let jwt = require("./jwt");

module.exports = async (req, res, next) => {
    let token = req.cookies["access_token"] ? req.cookies["access_token"] : removeCookieFlags(req.headers.access_token);
    if (!token) return res.sendStatus(403);
    try{
        req.auth = jwt.verify(token);
    } catch(error) {
        res.sendStatus(400);
    }
    next();
};

//This function's sole purpose is to aid in Cucumber tests where tokens are sent in cookies.
//For some unknown reason cooki-parser is not able to do it's work when doing Cucumber tests.
function removeCookieFlags(token) {
    let match = token.match(/(\;).*$/);
    if (!match) return;
    let cleanedToken = token.slice(0,match.index);

    return cleanedToken;
};
