module.exports = (users) => async (req, res) => {
    let { fullName, username, email, password } = req.body;

    let requestErrors = {
        errorCount: 0,
        fullName: [],
        username: [],
        email: [],
        password: []
    };

    fullName = validateFullName(fullName, requestErrors);

    username = validateUsername(username, requestErrors);

    email = validateEmail(email, requestErrors);

    password = validatePassword(password, requestErrors);

    if(requestErrors.errorCount) {
        res.status(400).send(requestErrors);
        return;
    }

    let result;
    try {
        result = await users.create(username, password, email, fullName);
    } catch(error) {
        if(error.code) {
            res.setHeader("content-type", "application/json");
            res.status(406).send({
                code: error.code,
                message: error.message
            });
            return;
        }
        if(!error.code) {
            res.status(500).json({message: "An error occured that you can't help. Please refresh and start over"});
            return;
        }
    }

    console.log(username + " " + email);
    res.setHeader("Content-Type", "application/json");
    res.send(result);
};

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
            code: "FORMAT",
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
            code: "FORMAT",
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
            code: "FORMAT",
            da: "Email formatet var ikke overholdt, prøv igen",
            value: email
        });
        requestErrors.errorCount++;
        return;
    }

    return email;
}

function validatePassword(password, requestErrors) {
    if(!password) {
        requestErrors.password.push({
            code: "MISSING",
            da: "Indtast venligst et password"
        });
        requestErrors.errorCount++;
        return;
    }

    password = password.trim();

    if(!password.match(/^(?=.*[a-zA-Z])(?=.*\d).{4,}$/)) {
        console.log("passed");
        requestErrors.password.push({
            code: "FORMAT",
            da: "Dit password skal være minimum 4 karaktere langt og indholde mindst et tal og et bogstav"
        });
        requestErrors.errorCount++;
        return;
    }

    return password;
}
