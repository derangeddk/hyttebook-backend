const createEndpoint = require("../../src/forms/create/endpoint");

describe("create endpoint", function() {
    it("fails if arguments are null", async function() {
        let newForm = { id: "test" };

        let forms = {
            create: jasmine.createSpy("forms.create", async () => newForm).and.callThrough()
        };

        let endpoint = createEndpoint(forms);

        // let res = jasmine.createSpyObj("res",{["send"]: jasmine.createSpy("res.send"), ["status"]: jasmine.createSpy("res.status")});

        let res = {};

        res.send = jasmine.createSpy("send").and.callFake(() => {
            return res;
        });

        res.status = jasmine.createSpy("status").and.callFake(() => {
            return res;
        });

        let req = {
            body: {
                showOrgType: null,
                showBankDetails: false,
                showEan: false,
                showCleaningToggle: false,
                defaultCleaningIncluded: true,
                showArrivalTime: false,
                showDepartureTime: false,
                stdArrivalTime: "",
                stdDepartureTime: "",
                stdInformation: ""
            }
        };

        let actualError = null;
        try{
            await endpoint(req, res);
        } catch(error) {
            actualError = error;
        }

        expect(actualError).toBe(null);
        expect(res.status.send).toHaveBeenCalledTimes(1);

        expect(res.status).toHaveBeenCalledWith(400);
    });
});