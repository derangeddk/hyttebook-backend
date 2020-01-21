module.exports = function mockFailOnQuery(db, querysToFailOn) {
    if (!querysToFailOn) {
        db.query= jasmine.createSpy("db.query").and.callFake(async () => {
            throw new Error("postgres exploded")
        });
    }
    
    if(typeof querysToFailOn === "string") {
        return mockFailOnQuery(db, [ querysToFailOn ]);
    }
    
    if (Array.isArray(querysToFailOn)) {
        let obj = {};
        querysToFailOn.forEach(q => obj[q] = new Error(`postgres exploded while trying to run a query starting with '${q}'.`));
        return mockFailOnQuery(db, obj);
    }
    
    db.query = jasmine.createSpy("db.query").and.callFake(async (query) => {
        Object.keys(querysToFailOn).forEach(q => { 
            if(query.startsWith(q)) {
                throw querysToFailOn[q];
            }
        });
    });
}
