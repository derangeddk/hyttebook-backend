const createEndpoint = require("./endpoint");

describe("users create endpoint", function() {
    it("creates a user with a username and a password", async function() {
        let newUser = {
            id: "some UUID",
            username: "test-user-05",
            fullName: "verdens bedste bruger 123"
     };

        let usersRepository = {
            create: jasmine.createSpy("users.create").and.callFake(async () => newUser)
        };

        let endpoint = createEndpoint(usersRepository);

        let req = {
            body: {
                username: "test-user-05",
                fullName: "verdens bedste bruger 123",
                email: "test-user-05@gmail.com",
                password: "testpassword"
            }
        };

        let res = {};
        res.send = jasmine.createSpy("res.send");
        res.cookie = jasmine.createSpy("cookie");
        res.setHeader = jasmine.createSpy("setHeader");

        await endpoint(req, res);

        expect(usersRepository.create).toHaveBeenCalledWith(
            'test-user-05',
            'testpassword',
            'test-user-05@gmail.com',
            'verdens bedste bruger 123'
        );
        expect(res.setHeader).toHaveBeenCalledWith("Content-Type", "application/json");
        expect(res.cookie).toHaveBeenCalledTimes(1);
        expect(res.send).toHaveBeenCalledWith(newUser);
    });
});
