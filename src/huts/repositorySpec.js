const HutsRepository = require("./repository");
const { sqlEquality } = require("../../spec/support/customEqualityTesters");

describe("huts repository" , function() {

    beforeEach(function () {
        jasmine.addCustomEqualityTester(sqlEquality);
    });

    describe("constructor function", function() {
        it("creates a repository if the huts and role_connections table already exists",async function() {
            let db = {
                query: async (query) => {
                    if(query == "SELECT 'public.huts'::regclass") return;
                    if(query == "SELECT 'public.role_connections'::regclass") return;
                }
            };

            let actualError = null;
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
            let db = {
                query: jasmine.createSpy("db.query").and.callFake(async (query) => {
                    if(query.startsWith("SELECT 'public.huts'::regclass")) {
                        throw new Error("exploded while checking if huts table exists");
                    }
                })
            };

            let hutsRepository = new HutsRepository(db);

            let actualError = null;
            try {
                await hutsRepository.initialize();
            } catch(error) {
                actualError = error;
            }

            expect(db.query).toHaveBeenCalledWith("SELECT 'public.huts'::regclass");
            expect(actualError).not.toBe(null);
        });

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

        it("creates the huts table if the table does not already exist",async function() {
            let db = {
                query: jasmine.createSpy("db.query").and.callFake(async (query) => {
                    if(query === `SELECT 'public.huts'::regclass`) {
                        throw new Error('relation "public.huts" does not exist');
                    }
                })
            };

            let actualError = null;
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
            let userId = "87bf5232-d8ee-475f-bf46-22dc5aac7531";

            let actualError = null;
            let hutsRepository = new HutsRepository(db);
            let id;

            try {
                id = await hutsRepository.create(hutData, userId);
            } catch(error) {
                actualError = error;
            }

            expect(actualError).toBe(null);
            expect(db.query).toHaveBeenCalledWith(`INSERT INTO huts(
                id,
                name,
                data
            )
            VALUES(
                $1::uuid,
                $2::text,
                $3::json
            )`,
            [
                id,
                hutData.hutName,
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

            let hutsRepository = new HutsRepository(db);
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
            let userId = "87bf5232-d8ee-475f-bf46-22dc5aac7531";

            try {
                id = await hutsRepository.create(hutData, userId);
            } catch(error) {
                actualError = error;
            }

            expect(actualError).not.toBe(null);
            expect(db.query).toHaveBeenCalledWith(`INSERT INTO huts(
                id,
                name,
                data
            )
            VALUES(
                $1::uuid,
                $2::text,
                $3::json
            )`,
            [
                jasmine.any(String),
                hutData.hutName,
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
                    if(query.startsWith("INSERT INTO formSettings")) {
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
            let userId = "87bf5232-d8ee-475f-bf46-22dc5aac7531";

            let actualError = null;
            let hutsRepository = new HutsRepository(db)

            try {
                await hutsRepository.create(hutData, userId);
            } catch(error) {
                actualError = error;
            }

            expect(actualError).not.toBe(null);
            expect(db.query).toHaveBeenCalledWith(`INSERT INTO huts(
                id,
                name,
                data
            )
            VALUES(
                $1::uuid,
                $2::text,
                $3::json
            )`,
            [
                jasmine.any(String),
                hutData.hutName,
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
            expect(db.query).toHaveBeenCalledWith(`INSERT INTO formSettings(
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
            };
            let userId = "87bf5232-d8ee-475f-bf46-22dc5aac7531";

            let hutsRepository = new HutsRepository(db)
            let hutId;

            let actualError = null;
            try {
                hutId = await hutsRepository.create(hutData, userId);
            } catch(error) {
                actualError = error;
            }

            expect(hutId).not.toBe(undefined);
            expect(actualError).toBe(null);
            expect(db.query).toHaveBeenCalledWith(
            `INSERT INTO huts(
                id,
                name,
                data
            )
            VALUES(
                $1::uuid,
                $2::text,
                $3::json
            )`,
            [
                hutId,
                hutData.hutName,
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
            expect(db.query).toHaveBeenCalledWith(
            `INSERT INTO formSettingsettings(
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
                hutId,
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
            ]);
        });

        it("fails if postgres explodes upon inserting a roleconnection after creating a hut and a form", async function() {
            let db = {
                query: jasmine.createSpy("db.query").and.callFake(async (query) => {
                    if(query.startsWith("INSERT INTO role_connections")) {
                        throw new Error("postgres exploded while trying to insert a roleconnection");
                    }
                })
            };

            let hutsRepository = new HutsRepository(db);

            let hutData = {
                hutName: "test hut",
                street: "test street",
                streetNumber: "1",
                city: "test city",
                zipCode: "2400",
                email: "test@test.test",
                phone: "74654010"
            };
            let userId = "87bf5232-d8ee-475f-bf46-22dc5aac7531";
            let hutId = jasmine.any(String);
            let role = 1;

            let actualError = null;
            try {
                hutId = await hutsRepository.create(hutData, userId);
            } catch(error) {
                actualError = error;
            }

            expect(db.query).toHaveBeenCalledWith(
            `INSERT INTO role_connections(
                user_id,
                hut_id,
                role
            )
            VALUES(
                $1::uuid,
                $2::uuid,
                $3::integer
            )`,
            [
                userId,
                hutId,
                role
            ]);
            expect(actualError).not.toBe(null);
        });

        it("implicitly creates an administrator role connection between the hut and the creating user after creating a hut and a form", async function() {
            let db = {
                query: jasmine.createSpy("db.query").and.callFake(async () => {})
            };

            let hutsRepository = new HutsRepository(db);

            let hutData = {
                hutName: "test hut",
                street: "test street",
                streetNumber: "1",
                city: "test city",
                zipCode: "2400",
                email: "test@test.test",
                phone: "74654010"
            };
            let userId = "87bf5232-d8ee-475f-bf46-22dc5aac7531";
            let hutId = jasmine.any(String);
            let role = 1;

            let actualError = null;
            try {
                hutId = await hutsRepository.create(hutData, userId);
            } catch(error) {
                actualError = error;
            }

            expect(db.query).toHaveBeenCalledWith(
            `INSERT INTO role_connections(
                user_id,
                hut_id,
                role
            )
            VALUES(
                $1::uuid,
                $2::uuid,
                $3::integer
            )`,
            [
                userId,
                hutId,
                role
            ]);
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
            let actualError = null;
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
            let actualError = null;
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
        it("fails if database explodes", async function() {
            let db = {
                query: jasmine.createSpy("db.query").and.callFake(async (query) => {
                    if(query.startsWith("SELECT role_connections.hut_id, huts.name FROM huts")) {
                        throw new Error("database exploded");
                    }
                })
            };

            let hutsRepository = new HutsRepository(db);

            let userId = "9bdf21e7-52b8-4529-991b-5f2df9de0323";

            let huts;

            let actualError = null;
            try {
                huts = await hutsRepository.findByUserId(userId);
            } catch(error) {
                actualError = error;
            }

            expect(actualError).not.toBe(null);
            expect(db.query).toHaveBeenCalledWith(
                `SELECT role_connections.hut_id, huts.name FROM huts
                JOIN role_connections ON huts.id = role_connections.hut_id
                WHERE role_connections.user_id = '${userId}'`
            );
        });

        it("succeeds if the user doesn't have any huts", async function() {
            let queryResult = {
                rows: []
            };

            let db = {
                query: jasmine.createSpy("db.query").and.callFake(async () => queryResult)
            };

            let hutsRepository = new HutsRepository(db);

            let userId = "9bdf21e7-52b8-4529-991b-5f2df9de0323";

            let huts;
            let actualError = null;
            try {
                huts = await hutsRepository.findByUserId(userId);
            } catch(error) {
                console.log("######", error);
                actualError = error;
            }

            expect(actualError).toBe(null);
            expect(db.query).toHaveBeenCalledWith(
                `SELECT role_connections.hut_id, huts.name FROM huts
                    JOIN role_connections ON huts.id = role_connections.hut_id
                    WHERE role_connections.user_id = '${userId}'`
            );
            expect(huts).toEqual(undefined);
        });
    });
});
