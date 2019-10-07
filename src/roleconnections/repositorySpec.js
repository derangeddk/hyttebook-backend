const RoleConnectionsRepository = require("./repository");

describe("roleConnections repositor", function() {
    describe("constructor function", function() {
        it("fails if the database explodes while checking if the role_connections table exists", async function() {
            let db = {
                query: jasmine.createSpy("db.query").and.callFake(async (query) => {
                    if(query.startsWith("SELECT 'public.role_connections'::regclass")) {
                        throw new Error("exploded while checking if role_connections table exists");
                    }
                })
            };

            let roleConnectionsRepository = new RoleConnectionsRepository(db);

            let actualError = null;
            try {
                await roleConnectionsRepository.initialize();
            } catch(error) {
                actualError = error;
            }

            expect(db.query).toHaveBeenCalledWith("SELECT 'public.role_connections'::regclass");
            expect(actualError).not.toBe(null);
        });

        it("creates the role_connections table if the table does not already exist",async function() {
            let db = {
                query: jasmine.createSpy("db.query").and.callFake(async (query) => {
                    if(query === `SELECT 'public.role_connections'::regclass`) {
                        throw new Error('relation "public.role_connections" does not exist');
                    }
                })
            };

            let roleConnectionsRepository = new RoleConnectionsRepository(db);

            let actualError = null;
            try {
                await roleConnectionsRepository.initialize();
            } catch(error) {
                actualError = error;
            }

            expect(actualError).toBe(null);
            expect(db.query.calls.count(2));
            expect(db.query.calls.allArgs(["SELECT 'public.role_connections'::regclass"], ['CREATE TABLE role_connections(user_id uuid NOT NULL, hut_id uuid NOT NULL, role integer NOT NULL)']));
        });

        it("fails if the database explodes while creating the role_connections table, if the table does not already exist", async function() {
            let db = {
                query: jasmine.createSpy("db.query").and.callFake(async (query) => {
                    if(query.startsWith("SELECT 'role_connections'::regclass")) {
                        throw new Error('relation "role_connections" does not exist');
                    }
                    if(query.startsWith("CREATE TABLE role_connections(user_id uuid NOT NULL, hut_id uuid NOT NULL, role integer NOT NULL)")) {
                        throw new Error('postgres exploded while creating the role_connections table');
                    } else {
                        throw new Error("Unexpected db call");
                    }
                })
            }

            let roleConnectionsRepository = new RoleConnectionsRepository(db);

            let actualError = null;
            try {
                await roleConnectionsRepository.initialize();
            } catch(error) {
                actualError = error;
            }

            expect(actualError).toEqual(jasmine.any(Error));
            expect(db.query.calls.allArgs(["SELECT 'public.huts'::regclass"],['CREATE TABLE huts(id uuid UNIQUE PRIMARY KEY, data json NOT NULL)']));
            expect(db.query.calls.count(2));
        });
    });
});