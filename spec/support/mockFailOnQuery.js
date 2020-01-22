module.exports = function mockFailOnQuery(db, queriesToFailOn) {
    if (!queriesToFailOn) {
        db.query.and.callFake(async () => {
            throw new Error("postgres exploded")
        });
    }
    
    if(typeof queriesToFailOn === "string") {
        return mockFailOnQuery(db, [ queriesToFailOn ]);
    }
    
    if (Array.isArray(queriesToFailOn)) {
        let obj = {};
        queriesToFailOn.forEach(q => obj[q] = new Error(`postgres exploded while trying to run a query starting with '${q}'.`));
        return mockFailOnQuery(db, obj);
    }
    
    db.query.and.callFake(async (query) => {
        Object.keys(queriesToFailOn).forEach(q => { 
            if(query.startsWith(q)) {
                throw queriesToFailOn[q];
            }
        });
    });
}
