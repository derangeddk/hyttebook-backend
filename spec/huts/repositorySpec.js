const rewire = require("rewire");
const createRepository = rewire("../../src/huts/repository");

describe("huts repository" , function() {
    describe("constructor function", function() {
        it("creates a repository if the huts table already exists",async function() {
            let db = {
                query: async (query) => {
                    if(query == "SELECT 'public.huts'::regclass") return;
                }
            };

            let actualError = null;
            let repository;
            try {
                repository = await createRepository(db);
            }
            catch(error) {
                actualError = error;
            }

            expect(actualError).toBe(null);
            expect(repository).toEqual({
                create: jasmine.any(Function)
            });
        });

        it("explodes if the database throws an error while checking if the huts table exists", async function() {
            let db = {
                query: jasmine.createSpy("db.query").and.callFake(async (query) => {
                    if(query == "SELECT 'public.huts'::regclass") {
                        throw new Error("exploded while checking if huts table exists");
                    }
                })
            };

            let actualError = null;
            try {
                await createRepository(db)
            }
            catch(error) {
                actualError = error;
            }

            expect(db.query).toHaveBeenCalledWith("SELECT 'public.huts'::regclass");
            expect(actualError).toEqual(jasmine.any(Error));
        });

        it("explodes if the database explodes while creating the huts table, if the table does not already exist", async function() {
            let db = {
                query: jasmine.createSpy("db.query").and.callFake(async (query) => {
                    if(query == "SELECT 'public.huts'::regclass") {
                        throw new Error('relation "public.huts" does not exist');
                    }
                    if(query == "CREATE TABLE huts(id uuid UNIQUE PRIMARY KEY, data json NOT NULL)") {
                        throw new Error('postgres exploded while creating the huts table');
                    } else {
                        throw new Error("Unexpected db call");
                    }
                })
            }

            let actualError = null;
            try {
                await createRepository(db)
            }
            catch(error) {
                actualError = error;
            }

            expect(actualError).toEqual(jasmine.any(Error));
            expect(db.query.calls.allArgs(["SELECT 'public.huts'::regclass"],['CREATE TABLE huts(id uuid UNIQUE PRIMARY KEY, data json NOT NULL)']));
            expect(db.query.calls.count(2));
        });

        it("creates the huts table if the table does not already exist",async function() {
            let db = {
                query: jasmine.createSpy("db.query").and.callFake(async (query) => {
                    if(query === `SELECT 'public.huts'::regclass`) {
                        throw new Error('relation "public.huts" does not exist');
                    }
                })
            };

            let actualError = null;
            try {
                await createRepository(db);
            } catch(error) {
                actualError = error;
            }

            expect(actualError).toBe(null);
            expect(db.query.calls.count(2));
            expect(db.query).toHaveBeenCalledWith('CREATE TABLE huts(id uuid UNIQUE PRIMARY KEY, data json NOT NULL)');
        });
    });

    describe("createHut function", function() {
        it("creates a hut and returns the hut's id", async function() {
            let db = {
                query: jasmine.createSpy("db.query").and.callFake(async () => {})
            };
            let hutData = {
                hutName: "test hut",
                street: "test street",
                streetNumber: "1",
                city: "test city",
                zipCode: "2400",
                email: "test@test.test",
                phone: "74654010"
            }

            let actualError = null;
            let repository = await createRepository(db)
            let id;

            try {
                id = await repository.create(hutData);
            } catch(error) {
                actualError = error;
            }

            expect(actualError).toBe(null);
            expect(db.query).toHaveBeenCalledWith(`INSERT INTO huts(
                id,
                data
            )
            VALUES(
                $1::uuid,
                $2::json
            )`,
            [
                id,
                {
                    createdAt: jasmine.any(String),
                    updatedAt: jasmine.any(String),
                    hutName: "test hut",
                    street: "test street",
                    streetNumber: "1",
                    city: "test city",
                    zipCode: "2400",
                    email: "test@test.test",
                    phone: "74654010"
                }
            ]);
        });

        it("fails if postgres throws an error while inserting a new hut", async function() {
            let db = {
                query: jasmine.createSpy("db.query").and.callFake(async (query) => {
                    if(query.startsWith("INSERT INTO huts")) {
                        throw new Error("postgress exploded while trying to insert a new hut");
                    }
                })
            }

            let repository = await createRepository(db);
            let actualError = null;
            let hutData = {
                hutName: "test hut",
                street: "test street",
                streetNumber: "1",
                city: "test city",
                zipCode: "2400",
                email: "test@test.test",
                phone: "74654010"
            }

            try {
                id = await repository.create(hutData);
            } catch(error) {
                actualError = error;
            }

            expect(actualError).not.toBe(null);
            expect(db.query).toHaveBeenCalledWith(`INSERT INTO huts(
                id,
                data
            )
            VALUES(
                $1::uuid,
                $2::json
            )`,
            [
                jasmine.any(String),
                {
                    createdAt: jasmine.any(String),
                    updatedAt: jasmine.any(String),
                    hutName: "test hut",
                    street: "test street",
                    streetNumber: "1",
                    city: "test city",
                    zipCode: "2400",
                    email: "test@test.test",
                    phone: "74654010"
                }
            ]);
        });

        it("fails if postgress explodes upon inserting a form after having created a hut", async function() {
            let db = {
                query: jasmine.createSpy("db.query").and.callFake(async (query) => {
                    if(query.startsWith("INSERT INTO forms")) {
                        throw new Error("postgres exploded while trying to insert a form");
                    }
                })
            };
            let hutData = {
                hutName: "test hut",
                street: "test street",
                streetNumber: "1",
                city: "test city",
                zipCode: "2400",
                email: "test@test.test",
                phone: "74654010"
            }
            let actualError = null;
            let repository = await createRepository(db)

            try {
                await repository.create(hutData);
            } catch(error) {
                actualError = error;
            }

            expect(actualError).not.toBe(null);
            expect(db.query).toHaveBeenCalledWith(`INSERT INTO forms(
                id,
                hutId,
                data
            )
            VALUES(
                $1::uuid,
                $2::uuid,
                $3::json
            )`,
            [
                id = jasmine.any(String),
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
            ])
        });

        it("implicitly creates a form after creating a hut", async function() {

        });
    });
});