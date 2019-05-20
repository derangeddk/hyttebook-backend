const createEndpoint = require("../../src/forms/create/endpoint");
const theoretically = require("jasmine-theories");

describe("create endpoint", function() {
    theoretically.it("fails if %s are null", [
        "showOrgType",
        "showBankDetails",
        "showEan",
        "showCleaningToggle",
        "defaultCleaningIncluded",
        "showArrivalTime",
        "showDepartureTime",
        "stdArrivalTime",
        "stdDepartureTime",
        "stdInformation",
    ],
    async function(nullProperty) {
        let newForm = { id: "test" };

        let forms = {
            create: jasmine.createSpy("forms.create").and.callFake(async () => newForm)
        };

        let endpoint = createEndpoint(forms);

        let res = {};

        res.send = jasmine.createSpy("res.send").and.callFake(() => {
            return res;
        });

        res.status = jasmine.createSpy("res.status").and.callFake(() => {
            return res;
        });

        let req = {
            body: {
                showOrgType: true,
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

        req.body[nullProperty] = null;

        let actualError = null;
        try{
            await endpoint(req, res);
        } catch(error) {
            actualError = error;
        }

        expect(actualError).toBe(null);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.status).toHaveBeenCalledTimes(1);

        let requestErrors = {
            errorCount: 1,
        };

        requestErrors[nullProperty] = {
            code: "NO VALUE",
            message : "must be a boolean value"
        };

        expect(res.send).toHaveBeenCalledWith({requestErrors});
        expect(res.send).toHaveBeenCalledTimes(1);
    });
});