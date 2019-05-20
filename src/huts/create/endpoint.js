module.exports = (huts) => async (req, res) => {
    let result;
    try {
        result = await huts.create(req.body);
    } catch(error) {
        console.error("tried to create the hut but couldn't: ", error);
        res.status(500).json({ message: "tried to create the hut but couldn't"}).send();
        return;
    }

    console.log(result);
    res.send(result);
};