const crypto = require('crypto');

function getSalt(saltLength) {
    return crypto.randomBytes(Math.ceil(saltLength/2)).toString('hex').slice(0,saltLength);
};

function hashPassword(password, salt) {
    let startTime = new Date();
    let iterations = 500000;
    let hash = crypto.pbkdf2Sync(password, salt, iterations, 512, 'sha512');
    // hash.update(password);
    let timeToHashComplete = new Date() - startTime;
    console.log(`It takes node ${timeToHashComplete}ms to encrypt the password with ${iterations} iterations`);
    console.log(`the password was ${hash.toString("hex")}`);
    return hash.toString("hex");
}

function hashedPasswordAndTypedPasswordMatch(salt, passwordHash, clearTextPassword) {
    let hashedClearTextPassword = hashPassword(clearTextPassword, salt);

    return hashedClearTextPassword === passwordHash ? true : false;
}

module.exports = {
    getSalt,
    hashPassword,
    hashedPasswordAndTypedPasswordMatch
};
