let jwt = require("./jwt");

module.exports = async (req, res, next) => {
    console.log("here's the req: ", req.cookies);
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
//For some unknown reason cookie-parser is not able to do it's work when doing Cucumber tests.
function removeCookieFlags(token) {
    if(!token) return;
    let tokenMatches;
    try {
        tokenMatches = token.match(/(\;).*$/);
    } catch(error) {
        console.error("removeCookieFlags trim function failed again: ", error);
        return;
    }
    if (!tokenMatches) return;
    let cleanedToken = token.slice(0,tokenMatches.index);

    return cleanedToken;
};
