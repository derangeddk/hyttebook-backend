module.exports = (hutsRepository) => async (req, res) => {
    let {
        hutName,
        street,
        streetNumber,
        city,
        zipCode,
        email,
        phone
    } = req.body;

    let userId = req.auth.user_id;

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
        result = await hutsRepository.create(req.body, userId);
    } catch(error) {
        console.error("tried to create the hut but couldn't: ", error);
        res.status(500).send({ error: "tried to create hut but couldn't"});
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
    if(typeof hutName !== 'string') {
        requestErrors.hutName = {
            code: "TYPE",
            da: "Hyttenavn skal være en tekst-streng"
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
    if(typeof street !== 'string') {
        requestErrors.street = {
            code: "TYPE",
            da: "Vejnavn skal være en tekst-streng"
        };
        requestErrors.errorCount++;
        return;
    }

    return street.trim();
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
    if(typeof streetNumber !== 'string') {
        requestErrors.streetNumber = {
            code: "TYPE",
            da: "Vej nummer skal være en tekst-streng"
        };
        requestErrors.errorCount++;
        return;
    }
    return streetNumber.trim();
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
    if(typeof city !== 'string') {
        requestErrors.city = {
            code: "TYPE",
            da: "Bynavn skal være en tekst-streng"
        };
        requestErrors.errorCount++;
        return;
    }
        
    return city.trim();
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

    if(typeof zipCode !== 'string') {
        requestErrors.zipCode = {
            code: "TYPE",
            da: "Postnummer skal være en tekst-streng"
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

    if(typeof email !== 'string') {
        requestErrors.email = {
            code: "TYPE",
            da: "Email skal være en tekst-streng"
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
    if(typeof phone !== 'string') {
        requestErrors.phone = {
            code: "TYPE",
            da: "Telefonnummer skal være en tekst-streng"
        };
        requestErrors.errorCount++;
        return;
    }

    return phone.trim();
}
