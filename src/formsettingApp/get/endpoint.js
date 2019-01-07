module.exports = (formsettings) => async (req, res) => {

    let formsetting = await formsettings.get(req.user);

    res.send(formsetting);
}