const createEndpoint = require("../../src/users/create/endpoint");

describe("create endpoint", function() {
    it("creates a user with a username and a password", async function() {
        //Setup
        let newUser = { id: "Lol" };

        let users = {
            create: jasmine.createSpy("users.create", async () => newUser).and.callThrough()
        };

        let endpoint = createEndpoint(users);

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
    });
});
