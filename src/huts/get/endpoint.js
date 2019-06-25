module.exports = (hutsRepository) => async (req, res) => {
    let hutid = req.params.id;

    let hut;
    try {
        hut = await hutsRepository.find(hutid);
    } catch(error) {
        console.error("tried to find a hut with an id, but couldn't ", error);
        res.status(500).send({ error: "tried to find a hut with an id, but couldn't" });
        return;
    }

    res.send(hut);
};
