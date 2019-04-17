module.exports = (forms) => async (req, res) => {
    // let {
    //         showOrgType,
    //         showBankDetails,
    //         showEan,
    //         showCleaningToggle,
    //         defaultCleaningInclude,
    //         showArrivalTime,
    //         showDepartureTime,
    //         stdArrivalTime,
    //         stdDepartureTime,
    //         stdInformation
    //     } = req.body;

    let formConfigs = req.body;

    let result;
    try {
        result = await forms.create(formConfigs);
    } catch(error) {
        console.error("tried to create the form but couldn't: ", error);
        res.status(500).json({ message: "tried to create the form but couldn't"});
    }

    console.log(result);
    res.send(result);

}