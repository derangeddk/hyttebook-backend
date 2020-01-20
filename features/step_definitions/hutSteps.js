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
        dayPrices
    } = dataTable.hashes()[0];

    let dayPricesCleaned = dayPrices.split(',').map(p => parseInt(p.trim()));
    let priceObject = {
        monday: dayPricesCleaned[0],
        tuesday: dayPricesCleaned[1],
        wednesday: dayPricesCleaned[2],
        thursday: dayPricesCleaned[3],
        friday: dayPricesCleaned[4],
        saturday: dayPricesCleaned[5],
        sunday: dayPricesCleaned[6]
    };

    let hutResponse = await this.client.post("/huts", { hutName, street, streetNumber, city, zipCode, email, phone, dayPrices: priceObject });
    this.hutId = hutResponse.data;
});

Then('I should receive a response containing an id', function () {
    assert(this.hutId != null, "hut id is null");
    assert(isValidUUID(this.hutId), "hut id is not a valid uuid");
});

Then('a hut should exist with the following information:', async function (dataTable) {
    let expectedHutData = dataTable.hashes()[0];
    expectedHutData.id = this.hutId;

    let response = await this.client.get(`/huts/${this.hutId}`);
    let actualHutData = {};
    Object.keys(expectedHutData).forEach(key => actualHutData[key] = response.data[key]);

    assert.deepStrictEqual(actualHutData, expectedHutData);
});

Then('the hut "xyz hut" has the following default prices:', async function (dataTable) {
    let expectedPriceData = dataTable.hashes()[0];

    let response = await this.client.get(`/huts/${this.hutId}`);
    let actualPriceData = response.data.dayPrices;

    assert(actualPriceData != null, "price data is null");
    assert.deepEqual(actualPriceData, expectedPriceData); // TODO DeepStrictEqual doesn't work, because expectedPriceData represents the numbers as strings???
});

Then('the hut should have a form', async function () {
    let actualForm = await this.client.get(`/forms/${this.hutId}`);

    assert.deepStrictEqual(actualForm.data.hutId, this.hutId);
});

Then('I should be admin of a hut named {string}', async function (string) {
    let response = await this.client.get(`/huts/`);

    let huts = response.data;

    assert.deepStrictEqual(string, huts[0].name);
    assert.deepStrictEqual(this.hutId, huts[0].hut_id);
});
