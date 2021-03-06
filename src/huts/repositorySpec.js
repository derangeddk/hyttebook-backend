const HutsRepository = require("./repository");
const { sqlEquality } = require("../../spec/support/customEqualityTesters");
const mockFailOnQuery = require("../../spec/support/mockFailOnQuery");
const getErrorsFromRunningFunction = require("../../spec/support/getErrorsFromRunningFunction");

describe("huts repository" , function() {
    let db, formsRepo;

    beforeEach(function () {
        db = {
            query: jasmine.createSpy("db.query")
        };
        formsRepo = {
            create: jasmine.createSpy("formsRepo.create")
        }
        jasmine.addCustomEqualityTester(sqlEquality); 
    });

    describe("constructor function", function() {
        let expectedSelectTableQuery, expectedCreateTableQuery;

        beforeEach(function() {
            db.query.and.callFake(async (query) => {
                if(query == "SELECT 'public.huts'::regclass") return;
                if(query == "SELECT 'public.role_connections'::regclass") return;
            })
            expectedSelectTableQuery = "SELECT 'public.huts'::regclass";
            expectedCreateTableQuery = "CREATE TABLE huts(id uuid UNIQUE PRIMARY KEY, name text NOT NULL, data json NOT NULL)";
        });

        it("creates a repository if the huts and role_connections table already exists",async function() {
            let hutsRepository = new HutsRepository(db, formsRepo);
            
            let actualError = await getErrorsFromRunningFunction(async () => hutsRepository.initialize());

            expect(actualError).toBe(null);
            expect(hutsRepository).toEqual({
                initialize: jasmine.any(Function),
                create: jasmine.any(Function),
                find: jasmine.any(Function),
                findByUserId:jasmine.any(Function)
            });
        });

        it("explodes if the database throws an error while checking if the huts table exists", async function() {
            mockFailOnQuery(db, "SELECT 'public.huts'::regclass");
            let hutsRepository = new HutsRepository(db, formsRepo);

            let actualError = await getErrorsFromRunningFunction(async () => hutsRepository.initialize());

            expect(db.query).toHaveBeenCalledWith(expectedSelectTableQuery);
            expect(actualError).not.toBe(null);
        });

        it("explodes if the database explodes while creating the huts table, if the table does not already exist", async function() {
            mockFailOnQuery(db, {
                "SELECT 'public.huts'::regclass": { message: `relation "public.huts" does not exist` },
                "CREATE TABLE huts": new Error("failed while trying to create 'huts' table")
            });
            let hutsRepository = new HutsRepository(db, formsRepo);
            
            let actualError = await getErrorsFromRunningFunction(async () => hutsRepository.initialize());

            expect(actualError).toEqual(jasmine.any(Error));
            expect(actualError.message).toEqual("failed while trying to create 'huts' table");
            expect(db.query.calls.allArgs()).toEqual([[expectedSelectTableQuery], [expectedCreateTableQuery]]);
            expect(db.query.calls.count(2));
        });

        it("creates the huts table if the table does not already exist",async function() {
            mockFailOnQuery(db, {
                "SELECT 'public.huts'::regclass": { message: `relation "public.huts" does not exist` }
            });
            let hutsRepository = new HutsRepository(db, formsRepo);

            let actualError = await getErrorsFromRunningFunction(async () => hutsRepository.initialize());

            expect(actualError).toBe(null);
            expect(db.query.calls.count(2));
            expect(db.query).toHaveBeenCalledWith(expectedCreateTableQuery);
        });
    });

    describe("createHut function", function() {
        let hutData, userId, implicitFormConfigs;
        let expectedHutQuery, expectedRoleConnectionQuery;
        let expectedHutArguments, expectedRoleConnectionArguments;

        beforeEach(function() {
            userId = "87bf5232-d8ee-475f-bf46-22dc5aac7531";
            hutData = {
                hutName: "test hut",
                street: "test street",
                streetNumber: "1",
                city: "test city",
                zipCode: "2400",
                email: "test@test.test",
                phone: "74654010"
            };
            expectedHutQuery = `INSERT INTO huts(id, name, data) VALUES( $1::uuid, $2::text, $3::json )`;
            expectedHutArguments = function(id) { 
                return [
                    id,
                    hutData.hutName,
                    {
                        createdAt: jasmine.any(String),
                        updatedAt: jasmine.any(String),
                        ...hutData
                    }
                ]
            };
            implicitFormConfigs = {
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
            }
            expectedRoleConnectionQuery = `INSERT INTO role_connections( user_id, hut_id, role)VALUES( $1::uuid, $2::uuid, $3::integer)`
            expectedRoleConnectionArguments = function(hutId) {
                return [
                    userId,
                    hutId,
                    role = 1
                ]
            }

        })

        it("creates a hut and returns the hut's id", async function() {
            let hutsRepository = new HutsRepository(db, formsRepo);
            let id;

            let actualError = await getErrorsFromRunningFunction(async () => {
                id = await hutsRepository.create(hutData, userId);
            });

            expect(actualError).toBe(null);
            expect(db.query).toHaveBeenCalledWith(expectedHutQuery, expectedHutArguments(id));
        });

        it("fails if postgres throws an error while inserting a new hut", async function() {
            mockFailOnQuery(db, "INSERT INTO huts");
            let hutsRepository = new HutsRepository(db, formsRepo);

            let actualError = await getErrorsFromRunningFunction(async () => await hutsRepository.create(hutData, userId));

            expect(actualError).not.toBe(null);
            expect(db.query).toHaveBeenCalledWith(expectedHutQuery, expectedHutArguments(jasmine.any(String)));
        });

        it("fails if formsRepo explodes upon inserting a form after having created a hut", async function() {
            formsRepo.create.and.callFake( async () => {
                throw new Error("failed to insert form")
            });
            let hutsRepository = new HutsRepository(db, formsRepo)

            let actualError = await getErrorsFromRunningFunction( async () => {
                await hutsRepository.create(hutData, userId)
            });

            expect(actualError).not.toBe(null);
            expect(db.query).toHaveBeenCalledWith(expectedHutQuery, expectedHutArguments(jasmine.any(String)));
            expect(formsRepo.create).toHaveBeenCalledWith(jasmine.any(String), implicitFormConfigs);
        });

        it("implicitly creates a form after creating a hut", async function() {
            let hutsRepository = new HutsRepository(db, formsRepo);
            let hutId;

            let actualError = await getErrorsFromRunningFunction(async () => {
                hutId = await hutsRepository.create(hutData, userId)
            });

            expect(hutId).not.toBe(undefined);
            expect(actualError).toBe(null);
            expect(db.query).toHaveBeenCalledWith(expectedHutQuery, expectedHutArguments(hutId));
            expect(formsRepo.create).toHaveBeenCalledWith(hutId, implicitFormConfigs);
        });

        it("fails if postgres explodes upon inserting a roleconnection after creating a hut and a form", async function() {
            mockFailOnQuery(db, "INSERT INTO role_connections");
            let hutsRepository = new HutsRepository(db, formsRepo);

            let actualError = await getErrorsFromRunningFunction(async () => await hutsRepository.create(hutData, userId));

            expect(db.query).toHaveBeenCalledWith(expectedRoleConnectionQuery, expectedRoleConnectionArguments(jasmine.any(String)));
            expect(actualError).not.toBe(null);
        });

        it("implicitly creates an administrator role connection between the hut and the creating user after creating a hut and a form", async function() {
            let hutsRepository = new HutsRepository(db, formsRepo);

            let hutId;
            let actualError = await getErrorsFromRunningFunction(async () => {
                hutId = await hutsRepository.create(hutData, userId)
            });

            expect(db.query).toHaveBeenCalledWith(expectedRoleConnectionQuery, expectedRoleConnectionArguments(hutId));
            expect(hutId).toEqual(jasmine.any(String));
            expect(actualError).toBe(null);
        });
    });

    describe("findHut function", function() {
        let hutId;

        beforeEach(function() {
            hutId = "9bdf21e7-52b8-4529-991b-5f2df9de0323";
        });

        it("fails if postgres throws an error while looking for the hut", async function() {
            mockFailOnQuery(db);
            let hutsRepository = new HutsRepository(db, formsRepo);
            
            let hut;
            let actualError = await getErrorsFromRunningFunction(async () => {
                hut = await hutsRepository.find(hutId)
            });

            expect(db.query).toHaveBeenCalledWith(`SELECT * FROM huts WHERE id = '${hutId}'`);
            expect(actualError).not.toBe(null);
            expect(hut).toEqual(undefined);
        });

        it("succeeds if a hut with the provided id exists", async function() {
            db.query.and.callFake(async () => hut);
            let hutsRepository = new HutsRepository(db, formsRepo);
            let hut = {
                rows: [
                    {
                        id: "some id",
                        data: {
                            hutName: "a hutname for testing puposes",
                            street: "test street",
                            streetNumber: "1",
                            city: "test city",
                            zipCode: "0001",
                            email: "test@test.com",
                            phone: "12345678"
                        }
                    }
                ]
            };

            let actualError = await getErrorsFromRunningFunction(async () => {
                await hutsRepository.find(hutId);
            });

            expect(db.query).toHaveBeenCalledWith(`SELECT * FROM huts WHERE id = '${hutId}'`);
            expect(actualError).toEqual(null);
        });
    });

    describe("findHutsByUserId function", function() {
        let userId; 
        let expectedQuery = (userId) => { 
            return `SELECT role_connections.hut_id, huts.name FROM huts
            JOIN role_connections ON huts.id = role_connections.hut_id
            WHERE role_connections.user_id = '${userId}'`
        };

        beforeEach(function() {
            userId = "9bdf21e7-52b8-4529-991b-5f2df9de0323";
        })

        it("fails if database explodes", async function() {
            mockFailOnQuery(db, "SELECT role_connections.hut_id, huts.name FROM huts");
            let hutsRepository = new HutsRepository(db, formsRepo);

            let actualError = await getErrorsFromRunningFunction(async () => await hutsRepository.findByUserId(userId));

            expect(actualError).not.toBe(null);
            expect(db.query).toHaveBeenCalledWith(expectedQuery(userId));
        });

        it("succeeds if the user doesn't have any huts", async function() {
            let queryResult = {
                rows: []
            };
            db.query.and.callFake(async () => queryResult)

            let hutsRepository = new HutsRepository(db, formsRepo);
            let huts; 

            let actualError = await getErrorsFromRunningFunction(async () => { 
                huts = await hutsRepository.findByUserId(userId);
            });

            expect(actualError).toBe(null);
            expect(db.query).toHaveBeenCalledWith(expectedQuery(userId));
            expect(huts).toEqual(undefined);
        });
    }); 
});
