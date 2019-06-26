module.exports = (formsRepository) => async (req, res) => {
    let hutId = req.params.id;

    let form;
    try {
        form = await formsRepository.find(hutId);
    } catch(error) {
        console.error("Tried to find a form but couldn't");
        res.status(500).send({ error: "Tried to find a form but couldn't" });
        return;
    }

    res.send(form);
    return;
};
