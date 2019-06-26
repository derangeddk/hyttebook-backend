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

    it("succeeds if a form exists with the provided id", async function() {
        let foundForm =  {
            rows: [
                {
                    id: "some id",
                    hutId: "9bdf21e7-52b8-4529-991b-5f2df9de0323",
                    data: {
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
                }
            ]
        };

        let db = {
            query: jasmine.createSpy("db.query").and.callFake(async () => foundForm)
        };

        let formsRepository = new FormsRepository(db);
        let form;

        let actualError = null;
        try {
            form = await formsRepository.find("9bdf21e7-52b8-4529-991b-5f2df9de0323");
        } catch(error) {
            actualError = error;
        }

        expect(actualError).toBe(null);
        expect(form).not.toEqual(undefined);
    });
});
