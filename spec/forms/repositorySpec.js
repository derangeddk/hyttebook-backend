const FormsRepository = require("../../src/forms/repository");

describe("findForm function", function() {
    it("fails if postgres throws an error while trying to find a form", async function() {
        let db = {
            query: jasmine.createSpy("db.query").and.callFake(async (query) => {
                if(query.startsWith("SELECT * FROM forms")){
                    throw new Error("postgres exploded while trying to find a form");
                }
            })
        };

        let formsRepository = new FormsRepository(db);

        let actualError = null;
        try {
            await formsRepository.find("9bdf21e7-52b8-4529-991b-5f2df9de0323");
        } catch(error) {
            actualError = error;
        }

        expect(actualError).not.toBe(null);
    });
});
