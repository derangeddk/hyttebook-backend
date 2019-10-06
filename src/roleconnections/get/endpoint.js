module.exports = (roleConnectionsRepository) => async (req, res) => {
    if(!req.auth) {
        res.status(400);
        res.send();
        return;
    }

    let roleConnection;
    try {
        console.log()
        roleConnection = await roleConnectionsRepository.findByUserId(req.auth.user_id);
    } catch (error) {
        console.error("roleConnections Respository failed while trying to find a roleConenction. Here's the error: ", error);
        res.status(500);
        res.send();
        return;
    }
};