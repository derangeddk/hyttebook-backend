const createEndpoint = require("../../src/users/create/endpoint");
const createFormsettingEndpoint = require("../../src/formsettingApp/create/endpoint")

describe("create endpoint", function() {
    it("creates a user with a username, password and formsettings", async function() {
        //Setup
        let newUser = { id: "Lol" };

        let users = {
            create: jasmine.createSpy("users.create", async () => newUser).and.callThrough()
        };

        let formsettings = {
            create: jasmine.createSpy("formsettings.create")
        };

        let endpoint = createEndpoint(users, formsettings);

        let req = {
            body: {
                username: "test-user-05",
                password: "verdens bedste bruger 123"
            }
        };

        let res = {
            send: jasmine.createSpy("res.send")
        };

        //Do
        await endpoint(req, res);

        //Evaluate
        expect(users.create).toHaveBeenCalledWith(req.body.username, req.body.password);
        expect(res.send).toHaveBeenCalledWith(newUser);
        expect(formsettings.create).toHaveBeenCalledWith(newUser);
    });
});
