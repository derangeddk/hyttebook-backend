const createEndpoint = require("../../src/huts/create/endpoint");
const theoretically = require('jasmine-theories');

describe("create endpoint" , function() {
    theoretically.it("fails if hutname has as empty string",[
        "hutName",
        "street",
        "streetNumber",
        "city",
        "zipCode",
        "email",
        "phone"
    ], async function(emptyProperty) {
        let req = {
            body: {
                hutName: "a hutname for testing puposes",
                street: "test street",
                streetNumber: "1",
                city: "test city",
                zipCode: "0001",
                email: "test@test.com",
                phone: "12345678"
            }
        };

        let res = {};

        res.send = jasmine.createSpy("res.send").and.callFake(() => {
            return res;
        });

        res.status = jasmine.createSpy("res.status").and.callFake(() => {
            return res;
        });

        let newHut = { id: "test" };

        let huts = {
            create: jasmine.createSpy("huts.create").and.callFake(async () => newHut)
        }

        let endpoint = createEndpoint(huts);

        req.body[emptyProperty] = "";

        let actualError = null;
        try {
            await endpoint(req, res);
        } catch(error) {
            actualError = error;
        }

        expect(actualError).toBe(null);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.status).toHaveBeenCalledTimes(1);
        expect(res.send).toHaveBeenCalledTimes(1);

        let requestErrors = {
            errorCount: 1,
        };
        requestErrors[emptyProperty] = {
            code: jasmine.any(String),
            da: jasmine.any(String)
        };

        expect(res.send).toHaveBeenCalledWith({requestErrors});
    });
});