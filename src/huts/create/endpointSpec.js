const createEndpoint = require("./endpoint");
const theoretically = require('jasmine-theories');

describe("'create' endpoint for huts" , function() {
    let hutPropertiesToBeTested = ["hutName","street","streetNumber","city","zipCode","email","phone", "dayPrices"]; 
    let user_id;
    let hutId;
    let hutData;
    let req;
    let res;
    let hutsRepository;
    let endpoint;
    let actualError;
    let requestErrors;

    beforeEach(function() {
        user_id = "87bf5232-d8ee-475f-bf46-22dc5aac7531";
        hutId = { id: "test" };
        hutData = {
            hutName: "a hutname for testing puposes",
            street: "test street",
            streetNumber: "1",
            city: "test city",
            zipCode: "0001",
            email: "test@test.com",
            phone: "12345678",
            dayPrices: {
                monday: 1000,
                tuesday: 1000,
                wednesday: 1000,
                thursday: 1000,
                friday: 1500,
                saturday: 1500,
                sunday: 1500
            }
        };
        req = {
            body: hutData,
            auth: { user_id }
        };

        res = {
            send: jasmine.createSpy("res.send").and.callFake(() => { return res; }),
            status: jasmine.createSpy("res.status").and.callFake(() => { return res; })
        };

        hutsRepository = {
            create: jasmine.createSpy("hutsRepository.create").and.callFake(async () => hutId)
        };
        endpoint = createEndpoint(hutsRepository);

        actualError = null;
        requestErrors = {
            errorCount: 1,
        };
    });

    theoretically.it("fails if %s has an empty string", hutPropertiesToBeTested, async function(emptyProperty) {
        req.body[emptyProperty] = "";

        requestErrors[emptyProperty] = {
            code: jasmine.any(String),
            da: jasmine.any(String)
        };

        try {
            await endpoint(req, res);
        } catch(error) {
            actualError = error;
        }

        expect(actualError).toBe(null);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.status).toHaveBeenCalledTimes(1);
        expect(res.send).toHaveBeenCalledTimes(1);
        expect(res.send).toHaveBeenCalledWith({requestErrors});
    });

    theoretically.it("fails if %s is missing", hutPropertiesToBeTested, async function(missingArgument) {
        delete req.body[missingArgument];

        requestErrors[missingArgument] = {
            code: jasmine.any(String),
            da: jasmine.any(String)
        };
        
        try {
            await endpoint(req, res);
        } catch(error) {
            actualError = error;
        }

        expect(actualError).toBe(null);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.status).toHaveBeenCalledTimes(1);
        expect(res.send).toHaveBeenCalledTimes(1);
        expect(res.send).toHaveBeenCalledWith({requestErrors});
    });

    it("succeeds if given all the required arguments", async function() {
        try {
            await endpoint(req, res);
        } catch(error) {
            actualError = error;
        }

        expect(actualError).toBe(null);
        expect(res.send).toHaveBeenCalledTimes(1);
        expect(res.send).toHaveBeenCalledWith(hutId);
        expect(hutsRepository.create).toHaveBeenCalledWith( hutData, user_id );
    });

    it("fails if the repository explodes", async function() {
        hutsRepository = {
            create: jasmine.createSpy("hutsRepository.create").and.callFake(async () => {
                throw new Error("huts repository exploded");
            })
        };

        endpoint = createEndpoint(hutsRepository);

        try { 
            await endpoint(req, res);
        } catch(error) {
            actualError = error;
        }

        expect(actualError).toBe(null);
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.status).toHaveBeenCalledTimes(1);
        expect(res.send).toHaveBeenCalledTimes(1);
        expect(res.send).toHaveBeenCalledWith({ error: "tried to create hut but couldn't"});
    });


    theoretically.it("fails if %s has an empty object", hutPropertiesToBeTested, async function(emptyProperty) {
        req.body[emptyProperty] = { };
        
        requestErrors[emptyProperty] = {
            code: jasmine.any(String),
            da: jasmine.any(String)
        };
        
        try {
            await endpoint(req, res);
        } catch(error) {
            actualError = error;
        }

        expect(actualError).toBe(null);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.status).toHaveBeenCalledTimes(1);
        expect(res.send).toHaveBeenCalledTimes(1);
        expect(res.send).toHaveBeenCalledWith({requestErrors});
    });

    /* TESTING PRICE PROPERTIES */

    theoretically.it("fails if price property %s is missing",[ "monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"], async function(priceProperty) {
        delete req.body.dayPrices[priceProperty];
        
        requestErrors.dayPrices = {
            code: jasmine.any(String),
            da: jasmine.any(String)
        };
        
        try {
            await endpoint(req, res);
        } catch(error) {
            actualError = error;
        }

        expect(actualError).toBe(null);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.status).toHaveBeenCalledTimes(1);
        expect(res.send).toHaveBeenCalledTimes(1);
        expect(res.send).toHaveBeenCalledWith({requestErrors}); //random error
    });

    theoretically.it("fails if price property %s is empty",[ "monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"], async function(priceProperty) {
        req.body.dayPrices[priceProperty] = "";
        
        requestErrors.dayPrices = {
            code: jasmine.any(String),
            da: jasmine.any(String)
        };
        
        try {
            await endpoint(req, res);
        } catch(error) {
            actualError = error;
        }

        expect(actualError).toBe(null);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.status).toHaveBeenCalledTimes(1);
        expect(res.send).toHaveBeenCalledTimes(1);
        expect(res.send).toHaveBeenCalledWith({requestErrors});
    });

    theoretically.it("fails if price property %s is negative",[ "monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"], async function(priceProperty) {
        req.body.dayPrices[priceProperty] = -priceProperty;
        
        requestErrors.dayPrices = {
            code: jasmine.any(String),
            da: jasmine.any(String)
        };
        
        try {
            await endpoint(req, res);
        } catch(error) {
            actualError = error;
        }

        expect(actualError).toBe(null);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.status).toHaveBeenCalledTimes(1);
        expect(res.send).toHaveBeenCalledTimes(1);
        expect(res.send).toHaveBeenCalledWith({requestErrors});
    });
});
