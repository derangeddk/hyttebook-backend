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
            actualError = error;
        }

        expect(actualError).toBe(null);
        expect(roleConnectionsRepository.findByUserId).toHaveBeenCalledWith("01ba3e22-2e93-463d-b77c-afe1686ce0e8");
        expect(res.send).toHaveBeenCalledTimes(1);
        expect(res.status).toHaveBeenCalledTimes(1);
        expect(res.status).toHaveBeenCalledWith(500);
    });

    it("should succeed if roleConnections repository returns a roleConnection", async function() {
        let roleConnection = {
            userId: "01ba3e22-2e93-463d-b77c-afe1686ce0e8",
            hutId: "77e258ac-8289-4748-9a7e-a9d15d47efab",
            role: "1"
        };
        
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
            }),
            cookie: jasmine.createSpy("res.coookie").and.callFake(() => {
                return res;
            })
        };

        let roleConnectionsRepository = {
            findByUserId: jasmine.createSpy("roleConnectionsRepository.findByUserId").and.callFake(async () => {
                return roleConnection;
            })
        };

        let endpoint = getEndpoint(roleConnectionsRepository);

        let actualError = null;
        try {
            await endpoint(req, res);
        } catch (error) {
            actualError = error;
        }

        expect(actualError).toBe(null);
        expect(roleConnectionsRepository.findByUserId).toHaveBeenCalledWith("01ba3e22-2e93-463d-b77c-afe1686ce0e8");
        expect(res.cookie).toHaveBeenCalledTimes(1);
        expect(res.cookie).toHaveBeenCalledWith("access_token", jasmine.any(String), { httpOnly: true, domain: "localhost" });
        expect(res.send).toHaveBeenCalledTimes(1);
    });
});