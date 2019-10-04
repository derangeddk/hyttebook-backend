let getEndpoint = require("./endpoint");

describe("get endpoint", function() {
    it("fails if huts repository explodes", async function() {
        let req = {
            params:{
                id: "9bdf21e7-52b8-4529-991b-5f2df9de0323"
            }
        };

        let res = {};

        res.send = jasmine.createSpy("res.send").and.callFake(() => {
            return res;
        });

        res.status = jasmine.createSpy("res.status").and.callFake(() => {
            return res;
        });

        let hutsRepository = {
            find: jasmine.createSpy("hutsRespository.find").and.callFake(async () => {
                throw new Error("huts repository exploded");
            })
        };

        let endpoint = getEndpoint(hutsRepository);
        let actualError = null;

        try{
            await endpoint(req, res);
        } catch(error) {
            actualError = error;
        }

        expect(actualError).toEqual(null);
        expect(res.send).toHaveBeenCalledTimes(1);
        expect(res.send).toHaveBeenCalledWith({error: "tried to find a hut with an id, but couldn't"});
        expect(res.status).toHaveBeenCalledTimes(1);
        expect(res.status).toHaveBeenCalledWith(500)
    });

    it("succeeds if huts repository can find the hut", async function() {
        let req = {
            params:{
                id: "9bdf21e7-52b8-4529-991b-5f2df9de0323"
            }
        };

        let res = {};
        res.send = jasmine.createSpy("res.send").and.callFake(() => {
            return res;
        });
        let hut = {
            id: "9bdf21e7-52b8-4529-991b-5f2df9de0323",
            hutName: "xyz hut",
            street: "xyz street",
            streetNumber: "12",
            city: "Havdrup",
            zipCode: "4622",
            email: "xyz@gmail.com",
            phone: "74654010"
        }

        let hutsRepository = {
            find: jasmine.createSpy("hutsRespository.find").and.callFake(async () => hut)
        };

        let endpoint = getEndpoint(hutsRepository);
        let actualError = null;
        let foundHut;

        try{
            foundHut = await endpoint(req, res);
        } catch(error) {
            actualError = error;
        }

        expect(actualError).toEqual(null);
        expect(res.send).toHaveBeenCalledTimes(1);
        expect(res.send).toHaveBeenCalledWith(hut);
    });
});
