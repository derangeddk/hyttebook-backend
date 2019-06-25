const { When, Then } = require("cucumber");
const assert = require("assert");

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

Then('I should receive a response containing an id', function () {
    this.hutId;
});

Then('a hut should exist with the following information:', async function (dataTable) {
    let expectedHutData = dataTable.hashes();
    let actualHutData = await this.client.get(`/huts/${this.hutId}`);

    assert.deepStrictEqual(actualHutData, expectedHutData);
});


Then('the hut should have a form', function () {
    // Write code here that turns the phrase above into concrete actions
    return 'pending';
});

Then('I should admin of a hut named {string}', function (string) {
    // Write code here that turns the phrase above into concrete actions
    return 'pending';
});

