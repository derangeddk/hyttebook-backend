const rewire = require("rewire");
const createRepository = rewire("../../src/huts/repository");

describe("huts repository" , function() {
    describe("constructor function", function() {
        it("creates a repository if the huts table already exists",async function() {
            let db = {
                query: async (q) => {
                    if(q == "SELECT 'public.huts'::regclass") return;
                    else throw new Error("Unexpected db call");
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
            expect(db.query).toHaveBeenCalledTimes(1);
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
            try{
                await createRepository(db);
            } catch(error) {
                actualError = error;
            }

            expect(actualError).toBe(null);
            expect(db.query.calls.count(2));
            expect(db.query.calls.allArgs(["SELECT 'public.huts'::regclass"],['CREATE TABLE huts(id uuid UNIQUE PRIMARY KEY, data json NOT NULL)']));
        });
    });
});