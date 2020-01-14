const { When, Then } = require("cucumber");
const assert = require("assert");
const {isValidUUID} = require("../../src/util.js");

When('I register a hut with the following information:', async function (dataTable) {
    let {
        hutName,
        street,
        streetNumber,
        city,
        zipCode,
        email,
        phone,
        prices
    } = dataTable.hashes()[0];

    let pricesCleaned = prices.split(',').map(p => parseInt(p.trim()));
    let pricesObject = {
        monday: pricesCleaned[0],
        tuesday: pricesCleaned[1],
        wednesday: pricesCleaned[2],
        thursday: pricesCleaned[3],
        friday: pricesCleaned[4],
        saturday: pricesCleaned[5],
        sunday: pricesCleaned[6]
    };

    let hutResponse = await this.client.post("/huts", { hutName, street, streetNumber, city, zipCode, email, phone, prices: pricesObject });
    this.hutId = hutResponse.data;
});

Then('I should receive a response containing an id', function () {
    assert(this.hutId != null, "hut id is null");
    assert(isValidUUID(this.hutId), "hut id is not a valid uuid");
});

Then('a hut should exist with the following information:', async function (dataTable) {
    let expectedHutData = dataTable.hashes()[0];
    expectedHutData.id = this.hutId;

    let actualHutData = await this.client.get(`/huts/${this.hutId}`);

    assert.deepStrictEqual(actualHutData.data, expectedHutData);
});

Then('the hut "xyz hut" has the following default prices:', async function (dataTable) {
    let expectedPriceData = dataTable.hashes()[0];

    let actualHutData = await this.client.get(`/huts/${this.hutId}`);
    let actualPriceData = actualHutData.prices;

    assert(actualPriceData != null, "prices is null");
    assert.deepStrictEqual(actualPriceData, expectedPriceData);
});

Then('the hut should have a form', async function () {
    let actualForm = await this.client.get(`/forms/${this.hutId}`);

    assert.deepStrictEqual(actualForm.data.hutId, this.hutId);
});

Then('I should be admin of a hut named {string}', async function (string) {
    let huts = await client.get(`/huts/`);

    assert.deepStrictEqual(string, huts[0].name);
  });
