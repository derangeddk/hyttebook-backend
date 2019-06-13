const createEndpoint = require("../../src/users/create/endpoint");

describe("create endpoint", function() {
    it("creates a user with a username and a password", async function() {
        let newUser = { id: "Lol" };

        let users = {
            create: jasmine.createSpy("users.create").and.callFake(async () => newUser)
        };

        let endpoint = createEndpoint(users);

        let req = {
            body: {
                username: "test-user-05",
                fullName: "verdens bedste bruger 123",
                email: "test-user-05@gmail.com",
                password: "testpassword"
            }
        };

        let res = {
            send: jasmine.createSpy("res.send")
        };
        res.setHeader = jasmine.createSpy("setHeader");

        await endpoint(req, res);

        expect(users.create).toHaveBeenCalledWith(
            'test-user-05',
            'testpassword',
            'test-user-05@gmail.com',
            'verdens bedste bruger 123'
        );
        expect(res.setHeader).toHaveBeenCalledWith("Content-Type", "application/json")
        expect(res.send).toHaveBeenCalledWith(newUser);
    });
});
