module.exports = (forms) => async (req, res) => {
    let actualFormConfigs = req.body;

    let expectedFormConfigs = [
        "showOrgType",
        "showBankDetails",
        "showEan",
        "showCleaningToggle",
        "defaultCleaningIncluded",
        "showArrivalTime",
        "showDepartureTime",
        "stdArrivalTime",
        "stdDepartureTime",
        "stdInformation"
    ];

    let requestErrors = {
        errorCount: 0,
    };

    expectedFormConfigs.forEach(key => {
        if(actualFormConfigs[key] == null) {
            requestErrors[key] = {
                code: "MISSING",
                error:  `missing '${key}' argument`
            };
            requestErrors.errorCount++;
        }
    });

    if(requestErrors.errorCount) {
        res.status(400).send({requestErrors});
        return;
    }

    let result;
    try {
        result = await forms.create(actualFormConfigs);
    } catch(error) {
        console.error("tried to create form but couldn't: ", error);
        res.status(500).send({ error: "tried to create the form but couldn't"});
        return;
    }

    res.send(result);
    return;
}