const HutsRepository = require("./repository");
const { sqlEquality } = require("../../spec/support/customEqualityTesters");

describe("huts repository" , function() {
    let actualError;

    function failOn (queryToFailOn, errormsg) { 
        let failingdb = {
            query: jasmine.createSpy("db.query").and.callFake(async (query) => {
                if(query.startsWith(queryToFailOn)) {
                    throw new Error(errormsg);
                }
            })
        }
        return failingdb;
    }

    beforeEach(function () {
        actualError = null;
        jasmine.addCustomEqualityTester(sqlEquality);
    });

    describe("constructor function", function() {
        let db;
        beforeEach(function() {
            db = {
                query: async (query) => {
                    if(query == "SELECT 'public.huts'::regclass") return;
                    if(query == "SELECT 'public.role_connections'::regclass") return;
                }
            };
        });

        it("creates a repository if the huts and role_connections table already exists",async function() {
            let hutsRepository = new HutsRepository(db);

            try {
                await hutsRepository.initialize();
            } catch(error) {
                actualError = error;
            }

            expect(actualError).toBe(null);
            expect(hutsRepository).toEqual({
                initialize: jasmine.any(Function),
                create: jasmine.any(Function),
                find: jasmine.any(Function),
                findByUserId:jasmine.any(Function)
            });
        });

        it("explodes if the database throws an error while checking if the huts table exists", async function() {
            db = failOn ("SELECT 'public.huts'::regclass", "exploded while checking if huts table exists");
            let hutsRepository = new HutsRepository(db);

            try {
                await hutsRepository.initialize();
            } catch(error) {
                actualError = error;
            }

            expect(db.query).toHaveBeenCalledWith("SELECT 'public.huts'::regclass");
            expect(actualError).not.toBe(null);
        });

        it("explodes if the database explodes while creating the huts table, if the table does not already exist", async function() {
            db = {
                query: jasmine.createSpy("db.query").and.callFake(async (query) => {
                    if(query.startsWith("SELECT 'public.huts'::regclass")) {
                        throw new Error('relation "public.huts" does not exist');
                    }
                    if(query.startsWith("CREATE TABLE huts(id uuid UNIQUE PRIMARY KEY, data json NOT NULL)")) {
                        throw new Error('postgres exploded while creating the huts table');
                    } else {
                        throw new Error("Unexpected db call");
                    }
                })
            }
            let hutsRepository = new HutsRepository(db);

            try {
                await hutsRepository.initialize();
            } catch(error) {
                actualError = error;
            }

            expect(actualError).toEqual(jasmine.any(Error));
            expect(db.query.calls.allArgs(["SELECT 'public.huts'::regclass"],['CREATE TABLE huts(id uuid UNIQUE PRIMARY KEY, data json NOT NULL)']));
            expect(db.query.calls.count(2));
        });

        it("creates the huts table if the table does not already exist",async function() {
            db = failOn(`SELECT 'public.huts'::regclass`, 'relation "public.huts" does not exist');
            let hutsRepository = new HutsRepository(db);

            try {
                await hutsRepository.initialize();
            } catch(error) {
                actualError = error;
            }

            expect(actualError).toBe(null);
            expect(db.query.calls.count(2));
            expect(db.query).toHaveBeenCalledWith(
                `CREATE TABLE huts(
                    id uuid UNIQUE PRIMARY KEY,
                    name text NOT NULL,
                    data json NOT NULL
                )`
            );
        });
    });

    describe("createHut function", function() {
        let db, hutData, userId, expectedHutQuery, expectedFormsQuery, expectedRoleConnectionQuery;
        let expectedHutArguments, expectedFormsArguments, expectedRoleConnectionArguments;

        beforeEach(function() {
            db = {
                query: jasmine.createSpy("db.query").and.callFake(async () => {})
            };
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
            expectedFormsQuery = `INSERT INTO forms( id, hutId, data) VALUES( $1::uuid, $2::uuid, $3::json)`;
            expectedFormsArguments = function(id) {             
                return [
                    id,
                    hutId = jasmine.any(String),
                    {
                        createdAt: jasmine.any(String),
                        updatedAt: jasmine.any(String),
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
                ]
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
            let hutsRepository = new HutsRepository(db);
            let id;

            try {
                id = await hutsRepository.create(hutData, userId);
            } catch(error) {
                actualError = error;
            }

            expect(actualError).toBe(null);
            expect(db.query).toHaveBeenCalledWith(expectedHutQuery,expectedHutArguments(id));
        });

        it("fails if postgres throws an error while inserting a new hut", async function() {
            db = failOn("INSERT INTO huts", "postgress exploded while trying to insert a new hut");
            let hutsRepository = new HutsRepository(db);

            try {
                id = await hutsRepository.create(hutData, userId);
            } catch(error) {
                actualError = error;
            }

            expect(actualError).not.toBe(null);
            expect(db.query).toHaveBeenCalledWith(expectedHutQuery,expectedHutArguments(jasmine.any(String)));
        });

        it("fails if postgress explodes upon inserting a form after having created a hut", async function() {
            let db = failOn("INSERT INTO forms","postgres exploded while trying to insert a form");
            let hutsRepository = new HutsRepository(db)

            try {
                await hutsRepository.create(hutData, userId);
            } catch(error) {
                actualError = error;
            }

            expect(actualError).not.toBe(null);
            expect(db.query).toHaveBeenCalledWith(expectedHutQuery,expectedHutArguments(jasmine.any(String)));
            expect(db.query).toHaveBeenCalledWith(expectedFormsQuery, expectedFormsArguments(jasmine.any(String)));
        });

        it("implicitly creates a form after creating a hut", async function() {
            let hutsRepository = new HutsRepository(db)
            let hutId;

            try {
                hutId = await hutsRepository.create(hutData, userId);
            } catch(error) {
                actualError = error;
            }

            expect(hutId).not.toBe(undefined);
            expect(actualError).toBe(null);
            expect(db.query).toHaveBeenCalledWith(expectedHutQuery,expectedHutArguments(hutId));
            expect(db.query).toHaveBeenCalledWith(expectedFormsQuery, expectedFormsArguments(jasmine.any(String)));
        });

        it("fails if postgres explodes upon inserting a roleconnection after creating a hut and a form", async function() {
            let db = failOn("INSERT INTO role_connections","postgres exploded while trying to insert a roleconnection");
            let hutsRepository = new HutsRepository(db);

            try {
                hutId = await hutsRepository.create(hutData, userId);
            } catch(error) {
                actualError = error;
            }

            expect(db.query).toHaveBeenCalledWith(expectedRoleConnectionQuery,expectedRoleConnectionArguments(jasmine.any(String)));
            expect(actualError).not.toBe(null);
        });

        it("implicitly creates an administrator role connection between the hut and the creating user after creating a hut and a form", async function() {
            let hutsRepository = new HutsRepository(db);
            let hutId;

            try {
                hutId = await hutsRepository.create(hutData, userId);
            } catch(error) {
                actualError = error;
            }

            expect(db.query).toHaveBeenCalledWith(expectedRoleConnectionQuery,expectedRoleConnectionArguments(hutId));
            expect(hutId).toEqual(jasmine.any(String));
            expect(actualError).toBe(null);
        });
    });

    describe("findHut function", function() {
        it("fails if postgres throws an error while looking for the hut", async function() {
            let db = {
                query: jasmine.createSpy("db.query").and.callFake(async () => {
                    throw new Error("postgres exploded while looking for a hut");
                })
            };
            let hutsRepository = new HutsRepository(db);

            let hutId = "9bdf21e7-52b8-4529-991b-5f2df9de0323";
            let hut;
            try {
                hut = await hutsRepository.find(hutId);
            } catch(error) {
                actualError = error;
            }

            expect(db.query).toHaveBeenCalledWith(`SELECT * FROM huts
                WHERE id = '${hutId}'`
            );
            expect(actualError).not.toBe(null);
            expect(hut).toEqual(undefined);
        });

        it("succeeds if a hut with the provided id exists", async function() {
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
            let db = {
                query: jasmine.createSpy("db.query").and.callFake(async () => hut)
            };
            let hutsRepository = new HutsRepository(db);

            let hutId = "9bdf21e7-52b8-4529-991b-5f2df9de0323";
            let foundHut;
            try {
                foundHut = await hutsRepository.find(hutId);
            } catch(error) {
                actualError = error;
            }

            expect(db.query).toHaveBeenCalledWith(`SELECT * FROM huts
                WHERE id = '${hutId}'`
            );
            expect(actualError).toEqual(null);
        });
    });

    describe("findHutsByUserId function", function() {
        let huts, userId; 
        let expectedQuery;

        beforeEach(function() {
            userId = "9bdf21e7-52b8-4529-991b-5f2df9de0323";
            huts = null;
            expectedQuery = function(userId) { 
                return `SELECT role_connections.hut_id, huts.name FROM huts
                JOIN role_connections ON huts.id = role_connections.hut_id
                WHERE role_connections.user_id = '${userId}'`
            }
        })

        it("fails if database explodes", async function() {
            let db = failOn("SELECT role_connections.hut_id, huts.name FROM huts", "database exploded");
            let hutsRepository = new HutsRepository(db);

            try {
                huts = await hutsRepository.findByUserId(userId);
            } catch(error) {
                actualError = error;
            }

            expect(actualError).not.toBe(null);
            expect(db.query).toHaveBeenCalledWith(expectedQuery(userId));
        });

        it("succeeds if the user doesn't have any huts", async function() {
            let queryResult = {
                rows: []
            };
            let db = {
                query: jasmine.createSpy("db.query").and.callFake(async () => queryResult)
            };
            let hutsRepository = new HutsRepository(db);

            try {
                huts = await hutsRepository.findByUserId(userId);
            } catch(error) {
                actualError = error;
            }

            expect(actualError).toBe(null);
            expect(db.query).toHaveBeenCalledWith(expectedQuery(userId));
            expect(huts).toEqual(undefined);
        });
    });
});
