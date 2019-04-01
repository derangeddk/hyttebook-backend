module.exports = (users) => async (req, res) => {
    let { hutName, firstName, lastName, email, password } = req.body;

    let requestErrors = {
        errorCount: 0,
        hutName: []
    };

    hutName = validateHutName(hutName, requestErrors);

    firstName = validateFirstName(firstName, requestErrors);

    lastName = validateLastName(lastName, requestErrors);

    email = validateEmail(email, requestErrors);

    password = validatePassword(password, requestErrors);

    if(requestErrors.errorCount) {
        res.status(400).send(requestErrors);
        return;
    }

    console.log(email + ' ' + password);

    let user = await users.create(email, password);
    res.send(user);
};

function validateHutName(hutName, requestErrors) {
    if(!hutName) {
        requestErrors.hutName.push({
            code: "MISSING",
            da: "Angiv venligst et hytte navn"
        });
        requestErrors.errorCount++;
        return;
    }
    hutName = hutName.trim();
    if(hutName.length < 3) {
        requestErrors.hutName.push({
            code: "TOO SHORT",
            da: "Det indtastede hytte navn er for kort",
            value: hutName
        });
        requestErrors.errorCount++;
        return;
    }
    return hutName;
}

function validateFirstName(firstName, requestErrors) {

}

function validateLastName(lastName, requestErrors) {

}

function validateEmail(email, requestErrors) {
    return email;
}

function validatePassword(password, requestErrors) {
    return password;
}