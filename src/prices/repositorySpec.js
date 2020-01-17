const PricesRepository = require("./repository");
const { sqlEquality } = require("../../spec/support/customEqualityTesters");

describe("prices repository" , function() {

    beforeEach(function () {
        jasmine.addCustomEqualityTester(sqlEquality);
    });

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

        it("explodes if the database explodes while creating the prices table, if the table does not already exist", async function() {
            let db = {
                query: jasmine.createSpy("db.query").and.callFake(async (query) => {
                    if(query.startsWith("SELECT 'public.prices'::regclass")) {
                        throw new Error('relation "public.prices" does not exist');
                    }
                    if(query.startsWith("CREATE TABLE prices(id uuid UNIQUE PRIMARY KEY, data json NOT NULL)")) {
                        throw new Error('postgres exploded while creating the prices table');
                    } else {
                        throw new Error("Unexpected db call");
                    }
                })
            }

            let actualError = null;
            let pricesRepository = new PricesRepository(db);

            try {
                await pricesRepository.initialize();
            } catch(error) {
                actualError = error;
            }

            expect(actualError).toEqual(jasmine.any(Error));
            expect(db.query.calls.allArgs(["SELECT 'public.prices'::regclass"],['CREATE TABLE prices(id uuid UNIQUE PRIMARY KEY, data json NOT NULL)']));
            expect(db.query.calls.count(2));
        });

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
            expect(db.query).toHaveBeenCalledWith(
                `CREATE TABLE prices(id uuid UNIQUE PRIMARY KEY, data json NOT NULL)`
            );
        });
    });

    describe("createPrice function", function() {
        it("creates a Price and returns the price's id", async function() {
            let db = {
                query: jasmine.createSpy("db.query").and.callFake(async () => {})
            };
            let dayPrices = {
                monday: 1000,
                tuesday: 1000,
                wednesday: 1000,
                thursday: 1000,
                friday: 1500,
                saturday: 1500,
                sunday: 1500
            }

            let actualError = null;
            let pricesRepository = new PricesRepository(db);
            let id;

            try {
                id = await pricesRepository.create(dayPrices);
            } catch(error) {
                actualError = error;
            }

            expect(actualError).toBe(null);
            expect(db.query).toHaveBeenCalledWith(`INSERT INTO prices(
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
                    ...dayPrices
                }
            ]);
        });

        it("fails if postgres throws an error while inserting a new price", async function() {
            let db = {
                query: jasmine.createSpy("db.query").and.callFake(async (query) => {
                    if(query.startsWith("INSERT INTO prices")) {
                        throw new Error("postgress exploded while trying to insert a new price");
                    }
                })
            }

            let dayPrices = {
                monday: 1000,
                tuesday: 1000,
                wednesday: 1000,
                thursday: 1000,
                friday: 1500,
                saturday: 1500,
                sunday: 1500
            }

            let actualError = null;
            let pricesRepository = new PricesRepository(db);
            let id;

            try {
                id = await pricesRepository.create(dayPrices);
            } catch(error) {
                actualError = error;
            }

            expect(actualError).not.toBe(null);
            expect(db.query).toHaveBeenCalledWith(`INSERT INTO prices(
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
                    ...dayPrices
                }
            ]);
        });
    });

    describe("findHutDayPrices function", function() {
        it("fails if postgres throws an error while looking for the price data", async function() {
            let db = {
                query: jasmine.createSpy("db.query").and.callFake(async () => {
                    throw new Error("postgres exploded while looking for the price data");
                })
            };
            let pricesRepository = new PricesRepository(db);

            let priceId = "9bdf21e7-52b8-4529-991b-5f2df9de0323";
            let actualError = null;
            let priceData;
            try {
                priceData = await pricesRepository.find(priceId);
            } catch(error) {
                actualError = error;
            }

            expect(db.query).toHaveBeenCalledWith(`SELECT * FROM prices WHERE id = '${priceId}'`);
            expect(actualError).not.toBe(null);
            expect(priceData).toEqual(undefined);
        });

        it("succeeds if price data with the provided id exists", async function() {
            let price = {
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
            let db = {
                query: jasmine.createSpy("db.query").and.callFake(async () => price)
            };
            let pricesRepository = new PricesRepository(db);

            let pricesId = "9bdf21e7-52b8-4529-991b-5f2df9de0323";
            let actualError = null;
            let foundPrice;
            try {
                foundPrice = await pricesRepository.find(pricesId);
            } catch(error) {
                actualError = error;
            }

            expect(db.query).toHaveBeenCalledWith(`SELECT * FROM prices WHERE id = '${pricesId}'`);
            expect(actualError).toEqual(null);
        });
    });
});
