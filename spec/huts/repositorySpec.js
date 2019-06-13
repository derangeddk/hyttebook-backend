const rewire = require("rewire");
const repository = rewire("../../src/huts/repository");

describe("huts repository" , function() {
    describe("ensureHutsTableExists", function() {
        describe("tableExists", function() {
            it("succeeds if a table exists", async function() {
                const tableExists = repository.__get__("tableExists");
                const mockDb = {
                    query: jasmine.createSpy("db.query").and.callFake(async () => true)
                }
                let theTableExists = await tableExists(mockDb);
                expect(mockDb.query).toHaveBeenCalledTimes(1);
                expect(theTableExists).toEqual(true);
            });

            it("fails if a table does not exist", async function() {
                const tableExists = repository.__get__("tableExists");
                const mockDb = {
                    query: jasmine.createSpy("db.query").and.callFake(async () => {
                        throw new Error("The huts table do not exist");
                    })
                }
                let theTableExists = await tableExists(mockDb);
                expect(mockDb.query).toHaveBeenCalledTimes(1);
                expect(theTableExists).toEqual(false);
            });
        });

        it("fails if postgres explodes", async function() {

        });

    });
});