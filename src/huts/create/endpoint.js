module.exports = (hutsRepository) => async (req, res) => {
    let {
        hutName,
        street,
        streetNumber,
        city,
        zipCode,
        email,
        phone,
        price
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
    validatePrice(price, requestErrors);

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

function validatePrice(price, requestErrors) {  // TODO check up on this
    if(!price) {
        requestErrors.price = {
            code: "MISSING",
            da: "Indtast venligst pris"
        };
        requestErrors.errorCount++;
        return;
    }
    if(!hasValidPriceProp(price, "monday", requestErrors)) return;
    if(!hasValidPriceProp(price, "tuesday", requestErrors)) return;
    if(!hasValidPriceProp(price, "wednesday", requestErrors)) return;
    if(!hasValidPriceProp(price, "thursday", requestErrors)) return;
    if(!hasValidPriceProp(price, "friday", requestErrors)) return;
    if(!hasValidPriceProp(price, "saturday", requestErrors)) return;
    if(!hasValidPriceProp(price, "sunday", requestErrors)) return;
}

function hasValidPriceProp(price, prop, requestErrors) {  // TODO check up on this
    if(!price[prop]) {
        requestErrors.price = {
            code: "MISSING",
            da: "Indtast venligst pris for " + prop
        };
        requestErrors.errorCount++;
        return false;
    }
    if(typeof price[prop] !== 'string') {
        requestErrors.price = {
            code: "TYPE",
            da: "Priser skal være en tekst-streng: " + prop
        };
        requestErrors.errorCount++;
        return false;
    }
    if(price[prop] < 0) {
        requestErrors.price = {
            code: "NEGATIV",
            da: "Indtast venligt en positiv pris for " + prop
        };
        requestErrors.errorCount++;
        return false;
    }
    return true;
}

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
