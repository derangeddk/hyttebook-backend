let jwt = require('jsonwebtoken');
const SECRET = "d3r4ng3d_3r-3n_k0nsu13nt-virks0mh3d!";

function sign(userId, hutId) {
    let token = jwt.sign({ 
        user_id: userId,
        hut_id: hutId,
        algorithm: "HS512", 
        expiresIn: 30 * 60 * 1000, 
        issuer: "hytteindex.dk"
     }, SECRET);
    return token;
}

function verify(token) {
    let decodedToken = jwt.verify(token, SECRET);
    return decodedToken;
}

module.exports = {
    sign,
    verify
};
