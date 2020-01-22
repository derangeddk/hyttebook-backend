const PricesRepository = require("./repository");
const { sqlEquality } = require("../../spec/support/customEqualityTesters");
const mockFailOnQuery = require("../../spec/support/mockFailOnQuery");
const getErrorsFromRunningFunction = require("../../spec/support/getErrorsFromRunningFunction");

describe("prices repository" , function() {
    let db;

    beforeEach(function () {
        db = {
            query: jasmine.createSpy("db.query")
        };
        jasmine.addCustomEqualityTester(sqlEquality);
    });

    describe("constructor function", function() {
        let expectedSelectTableQuery, expectedCreateTableQuery;

        beforeEach(function() {
            db.query.and.callFake(async (query) => {
                if(query == "SELECT 'public.prices'::regclass") return;
            });
            expectedSelectTableQuery = "SELECT 'public.prices'::regclass";
            expectedCreateTableQuery = 'CREATE TABLE prices(id uuid UNIQUE PRIMARY KEY, data json NOT NULL)';
        })

        it("creates a repository if the prices table already exists",async function() {
            let pricesRepository = new PricesRepository(db);

            let actualError = await getErrorsFromRunningFunction(async () => { await pricesRepository.initialize(); });

            expect(actualError).toBe(null);
            expect(pricesRepository).toEqual({
                initialize: jasmine.any(Function),
                create: jasmine.any(Function),
                find: jasmine.any(Function),
            });
        });

        it("explodes if the database throws an error while checking if the prices table exists", async function() {
            mockFailOnQuery(db, "SELECT 'public.prices'::regclass");
            let pricesRepository = new PricesRepository(db);

            let actualError = await getErrorsFromRunningFunction(async () => { await pricesRepository.initialize(); });

            expect(db.query).toHaveBeenCalledWith(expectedSelectTableQuery);
            expect(actualError).not.toBe(null);
        });

        it("explodes if the database explodes while creating the prices table, if the table does not already exist", async function() {
            mockFailOnQuery(db, {
                "SELECT 'public.prices'::regclass": { message: 'relation "public.prices" does not exist'},
                "CREATE TABLE prices": new Error('postgres exploded while creating the prices table')
            });

            // let db = {
            //     query: jasmine.createSpy("db.query").and.callFake(async (query) => {
            //         if(query.startsWith("SELECT 'public.prices'::regclass")) {
            //             throw new Error('relation "public.prices" does not exist');
            //         }
            //         if(query.startsWith("CREATE TABLE prices(id uuid UNIQUE PRIMARY KEY, data json NOT NULL)")) {
            //             throw new Error('postgres exploded while creating the prices table');
            //         } else {
            //             throw new Error("Unexpected db call");       !!!
            //         }
            //     })
            // }

            let pricesRepository = new PricesRepository(db);
            let actualError = await getErrorsFromRunningFunction(async () => { await pricesRepository.initialize(); });

            expect(actualError).toEqual(jasmine.any(Error));
            expect(actualError.message).toEqual("failed to create 'prices' table");
            expect(db.query.calls.allArgs()).toEqual([[expectedSelectTableQuery], [expectedCreateTableQuery]]);
            expect(db.query.calls.count(2));
        });

        it("creates the prices table if the table does not already exist", async function() {
            mockFailOnQuery(db, {
                "SELECT 'public.prices'::regclass": { message: 'relation "public.prices" does not exist'},
            });
            let pricesRepository = new PricesRepository(db);

            let actualError = await getErrorsFromRunningFunction(async () => { await pricesRepository.initialize(); });

            expect(actualError).toBe(null);
            expect(db.query.calls.count(2));
            expect(db.query).toHaveBeenCalledWith(expectedCreateTableQuery);
        });
    });

    describe("createPrice function", function() {
        let dayPrices, expectedQuery;
        let expectedArguments;

        beforeEach(function() {
            dayPrices = {
                monday: 1000,
                tuesday: 1000,
                wednesday: 1000,
                thursday: 1000,
                friday: 1500,
                saturday: 1500,
                sunday: 1500
            };
            expectedQuery = `INSERT INTO prices(id, data) VALUES($1::uuid, $2::json)`;
            expectedArguments = function(id) {
                return [
                    id,
                    {
                        createdAt: jasmine.any(String),
                        updatedAt: jasmine.any(String),
                        ...dayPrices
                    }
                ]
            };
        });

        it("creates a Price and returns the price's id", async function() {
            let pricesRepository = new PricesRepository(db);
            let id;

            let actualError = await getErrorsFromRunningFunction(async () => {
                id = await pricesRepository.create(dayPrices); 
            });

            expect(actualError).toBe(null);
            expect(db.query).toHaveBeenCalledWith(expectedQuery, expectedArguments(id));
        });

        it("fails if postgres throws an error while inserting a new price", async function() {
            mockFailOnQuery(db, "INSERT INTO prices");
            let pricesRepository = new PricesRepository(db);

            let actualError = await getErrorsFromRunningFunction(async () => {
                await pricesRepository.create(dayPrices); 
            });

            expect(actualError).not.toBe(null);
            expect(db.query).toHaveBeenCalledWith(expectedQuery, expectedArguments(jasmine.any(String)));
        });
    });

    describe("findHutDayPrices function", function() {
        let priceId, priceResponse, expectedSelectQuery;

        beforeEach(function() {
            priceId = "9bdf21e7-52b8-4529-991b-5f2df9de0323";
            priceResponse = {
                rows: [
                    {
                        id: "some id",
                        data: {
                            monday: 1000,
                            tuesday: 1000,
                            wednesday: 1000,
                            thursday: 1000,
                            friday: 1500,
                            saturday: 1500,
                            sunday: 1500
                        }
                    }
                ]
            };
            expectedSelectQuery = (id) => `SELECT * FROM prices WHERE id = '${priceId}'`;
        });

        it("fails if postgres throws an error while looking for the price data", async function() {
            mockFailOnQuery(db);
            let pricesRepository = new PricesRepository(db);
            let priceData;

            let actualError = await getErrorsFromRunningFunction(async () => { 
                priceData = await pricesRepository.find(priceId); 
            });

            expect(db.query).toHaveBeenCalledWith(expectedSelectQuery(priceId));
            expect(actualError).not.toBe(null);
            expect(priceData).toEqual(undefined);
        });

        it("succeeds if price data with the provided id exists", async function() {
            db.query.and.callFake(async () => priceResponse);
            let pricesRepository = new PricesRepository(db);
            let foundPrice;

            let actualError = await getErrorsFromRunningFunction(async () => {
                foundPrice = await pricesRepository.find(priceId);
            });

            expect(db.query).toHaveBeenCalledWith(expectedSelectQuery(priceId));
            expect(foundPrice).not.toBe(null);
            expect(actualError).toEqual(null);
        });
    });
});
