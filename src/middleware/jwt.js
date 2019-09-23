let jwt = require('jsonwebtoken');

function sign(userId) {
    let token = jwt.sign({ user_id: userId }, "d3r4ng3d_3r-3n_k0nsu13nt-virks0mh3d!", { algorithm: "HS512", expiresIn: 30 * 60 * 1000, issuer: "hytteindex.dk" });
    return token;
}

function verify(token) {
    let decodedToken = jwt.verify(token, "d3r4ng3d_3r-3n_k0nsu13nt-virks0mh3d!");
    return decodedToken;
}

module.exports = {
    sign,
    verify
};
