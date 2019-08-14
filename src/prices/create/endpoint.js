module.exports = ( /* priceRepository */ ) => async (req, res) => {
    res.send("test price");
    /*
    let {
        price
    } = req.body;

    let { userId } = req.auth;

    let requestErrors = {
        errorCount: 0,
    };

    validatePrice(price, requestErrors);

    if(requestErrors.errorCount) {
        res.status(400).send({requestErrors});
        return;
    }

    let result;
    try {
        result = await priceRepository.create(req.body, userId);
    } catch(error) {
        console.error("tried to create new price but couldn't: ", error);
        res.status(500).send({ error: "tried to create new price but couldn't"});
        return;
    }

    res.send(result);
    */
};

function validatePrice(price, requestErrors) {
    if(!price) {
        requestErrors.price = {
            code: "MISSING",
            da: "Indtast venligst pris"
        };
        requestErrors.errorCount++;
        return;
    }

    price = price.trim();

    if(!price.match(/^[0-9]*$/)) {
        requestErrors.price = {
            code: "FORMAT",
            da: "Må kun indeholde tal"
        };
        requestErrors.errorCount++;
        return;
    }

    return price;
}
