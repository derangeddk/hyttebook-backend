module.exports = (formsettings) => async (req, res) => {

    await formsettings.create(req.user);

    res.send("formsettings created");
}