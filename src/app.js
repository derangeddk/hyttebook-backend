const express = require("express");
const fs = require("fs");
const path = require("path");
const dummyScript = fs.readFileSync(path.join(__dirname, "dummyScript.js"), "utf8");
const usersApp = require("./users/app");

module.exports = (port, users) => {
    let app = express();

    app.get("/includes/:id/booking.js", (req, res) => {
        res.set("Content-Type", "application/javascript");
        res.send(dummyScript);
    });

    app.use("/users", usersApp(users));
    
    return {
        start: () => new Promise((resolve, reject) => {
            app.listen(port, (error) => {
                if(error) {
                    return reject(error);
                }
                console.log("Running server on port " + port);
                resolve();
            });
        })
    };
};
