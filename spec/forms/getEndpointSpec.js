const getEndpoint = require("../../src/forms/get/endpoint");

describe("get endpoint", function() {
    it("failes if the forms repository explodes", async function() {
        let req = {
            params: {
                id: "9bdf21e7-52b8-4529-991b-5f2df9de0323"
            }
        };

        let res = {};
        res.status = jasmine.createSpy("res.status").and.callFake(() => {
            return res;
        });
        res.send = jasmine.createSpy("res.send").and.callFake(() => {
            return res;
        });

        let formsRepository = {
            find: jasmine.createSpy("formsRepository.find").and.callFake(async () => {
                throw new Error("formsRepository exploded while trying to find a form");
            })
        };

        let endpoint = getEndpoint(formsRepository);

        let actualError = null;
        try {
            await endpoint(req, res);
        } catch(error) {
            actualError = error;
        }

        expect(actualError).toBe(null);
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.status).toHaveBeenCalledTimes(1);
        expect(res.send).toHaveBeenCalledTimes(1);
        expect(res.send).toHaveBeenCalledWith({ error: "Tried to find a form but couldn't" });
    });

    it("succeeds if a form with the provide hutId exists", async function() {
        let req = {
            params: {
                id: "9bdf21e7-52b8-4529-991b-5f2df9de0323"
            }
        };

        let res = {};
        res.send = jasmine.createSpy("res.send").and.callFake(() => {
            return res;
        });

        let form =  {
            hutId: "9bdf21e7-52b8-4529-991b-5f2df9de0323",
            showOrgType: false,
            showBankDetails: false,
            showEan: false,
            showCleaningToggle: false,
            defaultCleaningInclude: false,
            showArrivalTime: false,
            showDepartureTime: false,
            stdArrivalTime: false,
            stdDepartureTime: false,
            stdInformation: ""
        };

        let formsRepository = {
            find: jasmine.createSpy("formsRepository.find").and.callFake(async () => form)
        };

        let endpoint = getEndpoint(formsRepository);

        let actualError = null;
        try {
            await endpoint(req, res);
        } catch(error) {
            actualError = error;
        }

        expect(actualError).toBe(null);
        expect(res.send).toHaveBeenCalledTimes(1);
        expect(res.send).toHaveBeenCalledWith(form);
    });
});
