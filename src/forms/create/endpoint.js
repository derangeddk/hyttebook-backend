module.exports = (forms) => async (req, res) => {
    let formConfigs = req.body;

    let requestErrors = {
        errorCount: 0,
    };

    for(var property in formConfigs) {
        if(formConfigs[property] == null) {
            requestErrors[property] = {
                code: "NO VALUE",
                message:  "must be a boolean value"
            };
            requestErrors.errorCount++;
        }
    }

    if(requestErrors.errorCount) {
        res.status(400).send({requestErrors});
        return;
    }

    let result;
    try {
        result = await forms.create(formConfigs);
    } catch(error) {
        console.error("tried to create the form but couldn't: ", error);
        res.status(500).json({ error: "tried to create the form but couldn't"});
        return;
    }

    res.send(result);
    return;
}