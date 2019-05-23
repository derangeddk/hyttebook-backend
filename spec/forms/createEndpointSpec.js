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
            code: "MISSING",
            error : `missing '${nullProperty}' argument`
        };

        expect(res.send).toHaveBeenCalledWith({requestErrors});
        expect(res.send).toHaveBeenCalledTimes(1);
    });

    theoretically.it("fails if %s is missing from the request body", [
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
    async function(missingArgument) {
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

        delete req.body[missingArgument];

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

        requestErrors[missingArgument] = {
            code: "MISSING",
            error : `missing '${missingArgument}' argument`
        };

        expect(res.send).toHaveBeenCalledWith({requestErrors});
        expect(res.send).toHaveBeenCalledTimes(1);
    });


    it("fails if the forms repository explodes", async function() {
        let forms = {
            create: jasmine.createSpy("forms.create").and.callFake(async () => {
                throw new Error("forms repository exploded");
            })
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

        let actualError = null;
        try{
            await endpoint(req, res);
        } catch(error) {
            actualError = error;
        }

        expect(actualError).toBe(null);
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.status).toHaveBeenCalledTimes(1);
        expect(res.send).toHaveBeenCalledTimes(1);
        expect(res.send).toHaveBeenCalledWith({error: jasmine.any(String)});

    });

    it("succeeds when given all required arguments", async function() {
        let newForm = { id: "test" };

        let forms = {
            create: jasmine.createSpy("forms.create").and.callFake(async () => newForm)
        };

        let endpoint = createEndpoint(forms);

        let res = {};

        res.send = jasmine.createSpy("res.send").and.callFake(() => {
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

        let actualError = null;
        try{
            await endpoint(req, res);
        } catch(error) {
            actualError = error;
        }

        expect(actualError).toBe(null);
        expect(res.send).toHaveBeenCalledWith({ id: 'test' });
        expect(res.send).toHaveBeenCalledTimes(1);
    });
});