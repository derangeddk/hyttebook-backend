const FormsRepository = require("./repository");
const { sqlEquality } = require("../../spec/support/customEqualityTesters");
const mockFailOnQuery = require("../../spec/support/mockFailOnQuery");
const getErrorsFromRunningFunction = require("../../spec/support/getErrorsFromRunningFunction");

describe("forms repository", function() {
    let db;
        
    beforeEach(function() {
        db = {
            query: jasmine.createSpy("db.query")
        };
        jasmine.addCustomEqualityTester(sqlEquality); 
    })

    describe("createForm function", function() {
        let hutId, formConfigs, expectedFormsArguments;
        let expectedFormsQuery;
        
        beforeEach(function() {
            hutId = "9bdf21e7-52b8-4529-991b-5f2df9de0323";
            formConfigs = {
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
            expectedFormsQuery = `INSERT INTO forms( id, hutId, data) VALUES( $1::uuid, $2::uuid, $3::json)`;
            expectedFormsArguments = function(id) {             
                return [
                    id,
                    hutId = jasmine.any(String),
                    {
                        createdAt: jasmine.any(String),
                        updatedAt: jasmine.any(String),
                        ...formConfigs
                    }
                ]
            }
        })

        it("creates a form and returns the form's id", async function() {
            let formsRepository = new FormsRepository(db);
            let id;

            let actualError = await getErrorsFromRunningFunction(async () => {
                id = await formsRepository.create(hutId, formConfigs);
            });

            expect(actualError).toBe(null);
            expect(db.query).toHaveBeenCalledWith(expectedFormsQuery, expectedFormsArguments(id));
        });

        it("fails if postgres throws an error while inserting a new form", async function() {
            mockFailOnQuery(db, "INSERT INTO forms");
            let formsRepository = new FormsRepository(db);

            let actualError = await getErrorsFromRunningFunction(async () => {
                await formsRepository.create(hutId, formConfigs);
            });

            expect(actualError).not.toBe(null); 
            expect(db.query).toHaveBeenCalledWith(expectedFormsQuery, expectedFormsArguments(jasmine.any(String)));
        });
    })
    
    describe("findForm function", function() {
        it("fails if postgres throws an error while trying to find a form", async function() {
            mockFailOnQuery(db, "SELECT * FROM forms");
            let formsRepository = new FormsRepository(db);
    
            let actualError = await getErrorsFromRunningFunction(async () => {
                await formsRepository.find("9bdf21e7-52b8-4529-991b-5f2df9de0323");
            }); 
            
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
    
            db.query.and.callFake(async () => foundForm);
    
            let formsRepository = new FormsRepository(db);
            let form;
            
            let actualError = await getErrorsFromRunningFunction(async () => {
                form = await formsRepository.find("9bdf21e7-52b8-4529-991b-5f2df9de0323");
            }); 
    
            expect(actualError).toBe(null);
            expect(form).not.toEqual(undefined);
        });
    });    
});
