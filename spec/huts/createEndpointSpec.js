const createEndpoint = require("../../src/huts/create/endpoint");
const theoretically = require('jasmine-theories');

describe("create endpoint" , function() {
    theoretically.it("fails if %s has an empty string",[
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
            },
            auth: {
                userId: "87bf5232-d8ee-475f-bf46-22dc5aac7531"
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

        let hutsRepository = {
            create: jasmine.createSpy("hutsRepository.create").and.callFake(async () => newHut)
        }

        let endpoint = createEndpoint(hutsRepository);

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

    theoretically.it("fails if %s is missing",[
        "hutName",
        "street",
        "streetNumber",
        "city",
        "zipCode",
        "email",
        "phone"
    ], async function(missingArgument) {
        let req = {
            body: {
                hutName: "a hutname for testing puposes",
                street: "test street",
                streetNumber: "1",
                city: "test city",
                zipCode: "0001",
                email: "test@test.com",
                phone: "12345678"
            },
            auth: {
                userId: "87bf5232-d8ee-475f-bf46-22dc5aac7531"
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

        let hutsRepository = {
            create: jasmine.createSpy("hutsRepository.create").and.callFake(async () => newHut)
        }

        let endpoint = createEndpoint(hutsRepository);

        delete req.body[missingArgument];

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
        requestErrors[missingArgument] = {
            code: jasmine.any(String),
            da: jasmine.any(String)
        };

        expect(res.send).toHaveBeenCalledWith({requestErrors});
    });

    theoretically.it("fails if %s is missing",[
        "hutName",
        "street",
        "streetNumber",
        "city",
        "zipCode",
        "email",
        "phone"
    ], async function(missingArgument) {
        let req = {
            body: {
                hutName: "a hutname for testing puposes",
                street: "test street",
                streetNumber: "1",
                city: "test city",
                zipCode: "0001",
                email: "test@test.com",
                phone: "12345678"
            },
            auth: {
                userId: "87bf5232-d8ee-475f-bf46-22dc5aac7531"
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

        let hutsRepository = {
            create: jasmine.createSpy("hutsRepository.create").and.callFake(async () => newHut)
        };

        let endpoint = createEndpoint(hutsRepository);

        req.body[missingArgument] = null;

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
        requestErrors[missingArgument] = {
            code: jasmine.any(String),
            da: jasmine.any(String)
        };

        expect(res.send).toHaveBeenCalledWith({requestErrors});
    });

    it("succeeds if given all the required arguments", async function() {
        let req = {
            body: {
                hutName: "a hutname for testing puposes",
                street: "test street",
                streetNumber: "1",
                city: "test city",
                zipCode: "0001",
                email: "test@test.com",
                phone: "12345678"
            },
            auth: {
                userId: "87bf5232-d8ee-475f-bf46-22dc5aac7531"
            }
        };

        let res = {};
        res.send = jasmine.createSpy("res.send").and.callFake(() => {
            return res;
        });

        let newHut = { id: "test" };

        let hutsRepository = {
            create: jasmine.createSpy("hutsRepository.create").and.callFake(async () => newHut)
        };

        let endpoint = createEndpoint(hutsRepository);

        let actualError = null;
        try {
            await endpoint(req, res);
        } catch(error) {
            actualError = error;
        }

        expect(actualError).toBe(null);
        expect(res.send).toHaveBeenCalledTimes(1);
        expect(res.send).toHaveBeenCalledWith(newHut);
    });

    it("fails if the repository explodes", async function() {
        let req = {
            body: {
                hutName: "a hutname for testing puposes",
                street: "test street",
                streetNumber: "1",
                city: "test city",
                zipCode: "0001",
                email: "test@test.com",
                phone: "12345678"
            },
            auth: {
                userId: "87bf5232-d8ee-475f-bf46-22dc5aac7531"
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
            create: jasmine.createSpy("hutsRepository.create").and.callFake(async () => {
                throw new Error("huts repository exploded");
            })
        };

        let endpoint = createEndpoint(hutsRepository);

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
        expect(res.send).toHaveBeenCalledWith({ error: "tried to create hut but couldn't"});
    });
});
