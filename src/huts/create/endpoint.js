module.exports = (huts) => async (req, res) => {
    let {
        hutName,
        street,
        streetNumber,
        city,
        zipCode,
        email,
        phone
    } = req.body;

    let requestErrors = {
        errorCount: 0,
    };

    validateHutName(hutName, requestErrors);
    validateStreet(street, requestErrors);
    validateStreetNumber(streetNumber, requestErrors);
    validateCity(city, requestErrors);
    validateZipCode(zipCode, requestErrors);
    validateEmail(email, requestErrors);
    validatePhone(phone, requestErrors);

    if(requestErrors.errorCount) {
        res.status(400).send({requestErrors});
        return;
    }

    let result;
    try {
        result = await huts.create(req.body);
    } catch(error) {
        console.error("tried to create the hut but couldn't: ", error);
        res.status(500).json({ message: "tried to create the hut but couldn't"}).send();
        return;
    }

    res.send(result);
};

function validateHutName(hutName, requestErrors) {
    if(!hutName) {
        requestErrors.hutName = {
            code: "MISSING",
            da: "Indtast venligst hyttens navn"
        };
        requestErrors.errorCount++;
        return;
    }

    return hutName.trim();
}

function validateStreet(street, requestErrors) {
    if(!street) {
        requestErrors.street = {
            code: "MISSING",
            da: "Indtast venligst vejnavn"
        };
        requestErrors.errorCount++;
        return;
    }

    return street.trim();

    // if(street.length < 1) {
    //     requestErrors[street] = {
    //         code: "FORMAT",
    //         da: "skal være længere end et bogstav"
    //     };
    //     requestErrors.errorCount++;
    //     return;
    // }
}

function validateStreetNumber(streetNumber, requestErrors) {
    if(!streetNumber) {
        requestErrors.streetNumber = {
            code: "MISSING",
            da: "Indtast venligst vej nummeret"
        };
        requestErrors.errorCount++;
        return;
    }
}

function validateCity(city, requestErrors) {
    if(!city) {
        requestErrors.city = {
            code: "MISSING",
            da: "Indtast venligst bynavn"
        };
        requestErrors.errorCount++;
        return;
    }

    return city.trim();

    // if(city.length < 1) {
    //     requestErrors[city] = {
    //         code: "FORMAT",
    //         da: "skal være længere end et bogstav"
    //     };
    //     requestErrors.errorCount++;
    //     return;
    // }
}

function validateZipCode(zipCode, requestErrors) {
    if(!zipCode) {
        requestErrors.zipCode = {
            code: "MISSING",
            da: "Indtast venligst postnummeret"
        };
        requestErrors.errorCount++;
        return;
    }

    zipCode = zipCode.trim();

    if(!zipCode.match(/^[0-9]*$/)) {
        requestErrors.zipCode = {
            code: "FORMAT",
            da: "Må kun indeholde tal"
        };
        requestErrors.errorCount++;
        return;
    }

    return zipCode;
}

function validateEmail(email, requestErrors) {
    if(!email) {
        requestErrors.email = {
            code: "MISSING",
            da: "Indtast venligst en email"
        };
        requestErrors.errorCount++;
        return;
    }

    email = email.trim();

    if(!email.match(/^.+@.+$/)) {
        requestErrors.email = {
            code: "FORMAT",
            da: "skal have en gyldig email"
        };
        requestErrors.errorCount++;
        return;
    }

    return email;
}

function validatePhone(phone, requestErrors) {
    if(!phone) {
        requestErrors.phone = {
            code: "MISSING",
            da: "Indtast venligst telefonnummer"
        };
        requestErrors.errorCount++;
        return;
    }

    return phone.trim();

    // if(phone.length < 1) {
    //     requestErrors[phone] = {
    //         code: "FORMAT",
    //         da: "skal være længere end et tal"
    //     };
    //     requestErrors.errorCount++;
    //     return;
    // }
}