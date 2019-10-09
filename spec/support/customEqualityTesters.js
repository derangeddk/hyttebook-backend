const sqlParser = require("pg-query-parser");
const isEqual = require("lodash.isequal");

module.exports = {
    sqlEquality
};

function sqlEquality(first, second) {
    if (typeof first != "string" || typeof second != "string") return;

    let abstractSyntaxTreeForFirst = sqlParser.parse(first);
    if(abstractSyntaxTreeForFirst.error) return;
    if(!abstractSyntaxTreeForFirst.query.length) return;
    stripLocation(abstractSyntaxTreeForFirst);


    let abstractSyntaxTreeForSecond = sqlParser.parse(second);
    if(abstractSyntaxTreeForSecond.error) return;
    if(!abstractSyntaxTreeForSecond.query.length) return;
    stripLocation(abstractSyntaxTreeForSecond);

    if(isEqual(abstractSyntaxTreeForFirst, abstractSyntaxTreeForSecond)) {
        return true;
    }

    return false;
};

function stripLocation(input) {
    if(Array.isArray(input)) {
        return input.forEach(stripLocation);
    }

    if(typeof input == "object" && input != null ) {
        delete input.location

        let values = Object.values(input);
        values.forEach(stripLocation)
    }
}
