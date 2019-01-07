module.exports = (formsettings) => async (req, res) => {

    await formsettings.create(req.user);

    res.send("formsetting created");
}