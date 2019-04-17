module.exports = (forms) => async (req, res) => {
    let {
            showOrgType,
            showBankDetails,
            showEan,
            showCleaningToggle,
            defaultCleaningInclude,
            showArrivalTime,
            showDepartureTime,
            stdArrivalTime,
            stdDepartureTime,
            stdInformation
        } = req.body;

        console.log(showOrgType, showBankDetails, showEan, showCleaningToggle);
}