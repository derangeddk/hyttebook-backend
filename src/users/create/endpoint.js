module.exports = (users) => async (req, res) => {
    let { hutName, fullName, username, email, password } = req.body;

    let requestErrors = {
        errorCount: 0,
        hutName: [],
        fullName: [],
        username: [],
        email: [],
        password: []
    };

    hutName = validateHutName(hutName, requestErrors);

    fullName = validateFullName(fullName, requestErrors);

    username = validateUsername(username, requestErrors);

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

function validateFullName(fullName, requestErrors) {
    if(!fullName) {
        requestErrors.fullName.push({
            code: "MISSING",
            da: "Indtast venligst et navn"
        });
        requestErrors.errorCount++;
        return;
    }

    fullName = fullName.trim();

    if(fullName.length < 1) {
        requestErrors.fullName.push({
            code: "TOO SHORT",
            da: "Venligst indtast et længere navn",
            value: fullName
        });
        requestErrors.errorCount++;
        return;
    }

    return fullName;
}

function validateUsername(username, requestErrors) {
    if(!username) {
        requestErrors.username.push({
            code: "MISSING",
            da: "Indtast venligst et brugernavn"
        });
        requestErrors.errorCount++;
        return;
    }

    username = username.trim();

    if(username.length < 1) {
        requestErrors.username.push({
            code: "TOO SHORT",
            da: "Venligst indtast et længere brugernavn",
            value: username
        });
        requestErrors.errorCount++;
        return;
    }

    return username;
}

function validateEmail(email, requestErrors) {
    if(!email) {
        requestErrors.email.push({
            code: "MISSING",
            da: "Indtast venligst en email"
        });
        requestErrors.errorCount++;
        return;
    }

    email = email.trim();

    if(!email.match(/^.+@.+$/)) {
        requestErrors.email.push({
            code: "INVALID FORMAT",
            da: "Email formatet var ikke overholdt, prøv igen",
            value: email
        });
        requestErrors.errorCount++;
        return;
    }

    return email;
}

function validatePassword(password, requestErrors) {
    return password;
}