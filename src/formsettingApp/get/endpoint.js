module.exports = (formsettings) => async (req, res) => {

    let formsetting = await formsettings.get(req.user.id);

    res.send(formsetting);
}