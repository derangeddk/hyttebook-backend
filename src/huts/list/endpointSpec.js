const listEndpoint = require("./endpoint");

describe("list huts endpoint", function() {
    it("fails if huts repository explodes", async function() {
        let req = {
            auth: {
                user_id: "dbca09ec-a21b-41c5-af8e-3ce26955f8d5"
            }
        };

        let res = {
            send: jasmine.createSpy("res.send").and.callFake(() => {
                return res;
            }),
            status: jasmine.createSpy("res.status").and.callFake(() => {
                return res;
            })
        }

        let hutsRepository = {
            findAllByUserId: jasmine.createSpy("hutsRespository.findAllByUserId").and.callFake(async () => {
                throw new Error("huts repository exploded");
            })
        };

        let endpoint = listEndpoint(hutsRepository);

        let actualError = null;
        try {
            await endpoint(req, res);
        } catch (error) {
            console.log(error);
            actualError = error;
        }

        expect(actualError).toBe(null);
        expect(res.status).toHaveBeenCalledTimes(1);
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.send).toHaveBeenCalledTimes(1);
        expect(res.send).toHaveBeenCalledWith({error: "an error has occured. Please retry"});
    });

    it("succeeds if huts are found for the user", async function() {
        let req = {
            auth: {
                user_id: "dbca09ec-a21b-41c5-af8e-3ce26955f8d5"
            }
        };

        let res = {
            send: jasmine.createSpy("res.send").and.callFake(() => {
                return res;
            }),
        }

        let huts = [
            {
                id: "f52ef921-e7d7-4072-b224-93323dd3d71d",
                name: "test hut 1"
            },
            {
                id: "aa5dcc78-4101-4de6-944c-7457bc711547",
                name: "test hut 2"
            }
        ];

        let hutsRepository = {
            findAllByUserId: jasmine.createSpy("hutsRespository.findAllByUserId").and.callFake(async () => {
                return huts;
            })
        };

        let endpoint = listEndpoint(hutsRepository);

        let actualError = null;
        try {
            await endpoint(req, res);
        } catch (error) {
            actualError = error;
        }

        expect(actualError).toBe(null);
        expect(res.send).toHaveBeenCalledTimes(1);
        expect(res.send).toHaveBeenCalledWith({ huts });
    });

    it("succeeds if no huts are found for the user", async function() {
        let req = {
            auth: {
                user_id: "dbca09ec-a21b-41c5-af8e-3ce26955f8d5"
            }
        };

        let res = {
            send: jasmine.createSpy("res.send").and.callFake(() => {
                return res;
            }),
            status: jasmine.createSpy("res.status").and.callFake(() => {
                return res;
            })
        }

        //no huts where found
        let huts = [];

        let hutsRepository = {
            findAllByUserId: jasmine.createSpy("hutsRespository.findAllByUserId").and.callFake(async () => {
                return huts;
            })
        };

        let endpoint = listEndpoint(hutsRepository);

        let actualError = null;
        try {
            await endpoint(req, res);
        } catch (error) {
            actualError = error;
        }

        expect(actualError).toBe(null);
        expect(res.status).toHaveBeenCalledTimes(1);
        expect(res.status).toHaveBeenCalledWith(204);
        expect(res.send).toHaveBeenCalledTimes(1);
        expect(res.send).toHaveBeenCalledWith({ message: "The user are not affiliated with any huts" });
    });
});