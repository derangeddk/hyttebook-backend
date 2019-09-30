const rewire = require("rewire");
const PricesRepository = rewire("../../src/prices/repository");

describe("prices repository" , function() {
    describe("constructor function", function() {
        it("creates a repository if the prices table already exists",async function() {
            let db = {
                query: async (query) => {
                    if(query == "SELECT 'public.prices'::regclass") return;
                }
            };

            let actualError = null;
            let pricesRepository = new PricesRepository(db);

            try {
                await pricesRepository.initialize();
            } catch(error) {
                actualError = error;
            }

            expect(actualError).toBe(null);
            expect(pricesRepository).toEqual({
                initialize: jasmine.any(Function),
                create: jasmine.any(Function),
                find: jasmine.any(Function),
            });
        });

        it("explodes if the database throws an error while checking if the prices table exists", async function() {
            let db = {
                query: jasmine.createSpy("db.query").and.callFake(async (query) => {
                    if(query.startsWith("SELECT 'public.prices'::regclass")) {
                        throw new Error("exploded while checking if prices table exists");
                    }
                })
            };

            let pricesRepository = new PricesRepository(db);

            let actualError = null;
            try {
                await pricesRepository.initialize();
            } catch(error) {
                actualError = error;
            }

            expect(db.query).toHaveBeenCalledWith("SELECT 'public.prices'::regclass");
            expect(actualError).not.toBe(null);
        });
/*
        it("explodes if the database explodes while creating the huts table, if the table does not already exist", async function() {
            let db = {
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

            let actualError = null;
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
*/
        it("creates the prices table if the table does not already exist",async function() {
            let db = {
                query: jasmine.createSpy("db.query").and.callFake(async (query) => {
                    if(query === `SELECT 'public.prices'::regclass`) {
                        throw new Error('relation "public.prices" does not exist');
                    }
                })
            };

            let actualError = null;
            let pricesRepository = new PricesRepository(db);

            try {
                await pricesRepository.initialize();
            } catch(error) {
                actualError = error;
            }

            expect(actualError).toBe(null);
            expect(db.query.calls.count(2));
            expect(db.query).toHaveBeenCalledWith('CREATE TABLE prices(id uuid UNIQUE PRIMARY KEY, data json NOT NULL)');
        });
    });
});
