const getEndpoint = require("./endpoint");

describe("roleConnections get from head endpoint", function() {
    it("should fail if header doesn't contain a JWT", async function() {
        let req = {};

        let res = {
            status: jasmine.createSpy("res.status").and.callFake(() => {
                return res;
            }),
            send: jasmine.createSpy("res.send").and.callFake(() => { 
                return res;
            })
        };

        let roleConnectionsRepository = {
            find: jasmine.createSpy("roleConnectionsRepository.findByUserId").and.callFake(async () => {})
        };

        let endpoint = getEndpoint(roleConnectionsRepository);

        try {
            await endpoint(req, res);
        } catch (error) {
            error;
        }

        expect(res.send).toHaveBeenCalledTimes(1);
        expect(res.status).toHaveBeenCalledTimes(1);
        expect(res.status).toHaveBeenCalledWith(400);
    });

    it("should fail if roleConnections repository explodes", async function() {
        let req = {
            auth: {
                user_id: "01ba3e22-2e93-463d-b77c-afe1686ce0e8"
            }
        };

        let res = {
            status: jasmine.createSpy("res.status").and.callFake(() => {
                return res;
            }),
            send: jasmine.createSpy("res.send").and.callFake(() => { 
                return res;
            })
        };

        let roleConnectionsRepository = {
            findByUserId: jasmine.createSpy("roleConnectionsRepository.findByUserId").and.callFake(async () => {
                throw new Error("roleConnectionsRepository exploded");
            })
        };

        let endpoint = getEndpoint(roleConnectionsRepository);

        let actualError = null;
        try {
            await endpoint(req, res);
        } catch (error) {
            console.log(error);
            actualError = error;
        }

        expect(actualError).toBe(null);
        expect(roleConnectionsRepository.findByUserId).toHaveBeenCalledWith("01ba3e22-2e93-463d-b77c-afe1686ce0e8");
        expect(res.send).toHaveBeenCalledTimes(1);
        expect(res.status).toHaveBeenCalledTimes(1);
        expect(res.status).toHaveBeenCalledWith(500);
    });
});