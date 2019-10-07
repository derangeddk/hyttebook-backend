module.exports = (hutsRepository) => async (req, res) => {
    let huts;
    try {
        huts = await hutsRepository.findAllByUserId(req.auth.user_id);
    } catch(error) {
        console.error("hutsRepository failed with the following error: ", error);
        res.status(500);
        res.send({ error: "an error has occured. Please retry" });
        return;
    }

    if(huts.length === 0) {
        res.status(204);
        res.send({ message: "The user are not affiliated with any huts" });
        return;
    }

    res.send({ huts });
    return;
};