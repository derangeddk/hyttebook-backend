const { Given } = require("cucumber");
const uuid = require("uuid");

Given('I am authenticated as a user', async function () {
    let username = uuid.v4() + "@integration-test.hytteindex.dk";
    let email = username;
    let password = uuid.v4();
    let fullName = "FullName" + uuid.v4();

    let usersReponse = await this.client.post("/users", { username, email, password, fullName });


    let jwt = retrieveToken(usersReponse.headers['set-cookie'][0])
    this.setUser(jwt);
});

function retrieveToken(cookieWithToken) {
    let tokenArray = cookieWithToken.match(/(?<=\=).*$/);
    return tokenArray[0];
}
