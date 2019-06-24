const { When } = require("cucumber");

When('I register a hut with the following information:', async function (dataTable) {
    let {
        hutName,
        street,
        streetNumber,
        city,
        zipCode,
        email,
        phone
    } = dataTable.hashes()[0];


    let hutResponse = await this.client.post("/huts", { hutName, street, streetNumber, city, zipCode, email, phone });
    this.hutId = hutResponse.data;
});
