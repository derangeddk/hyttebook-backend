module.exports = (formsRepository) => async (req, res) => {
    let actualFormConfigs = req.body;
    let hutId = req.params.id;

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


    try {
        result = await formsRepository.update(hutId, actualFormConfigs);
    } catch(error) {
        console.error("tried to update form but couldn't: ", error);
        res.status(500).send({ error: "tried to update the form but couldn't"});
        return;
    }

    res.sendStatus(200);
    return;
}
