const { Given, When, Then } = require("cucumber");
const assert = require("assert");
const uuid = require("uuid");
const { isValidUuid } = require("../../src/utils/isValidUuid");

Given('I have registered a hut with id xyz', async function () {
    
});

When('I add a seasonal price with the following information:', async function (dataTable) {
    let {
        hutId,
        dayPrices,
        startDate,
        endDate
    } = dataTable.hashes()[0];

    let [ monday, tuesday, wednesday, thursday, friday, saturday, sunday ] = dayPrices.split(',').map(p => parseInt(p.trim()));
    let priceObject = { monday, tuesday, wednesday, thursday, friday, saturday, sunday };

    let priceResponse = await this.client.post("/prices", { hutId, dayPrices: priceObject, startDate, endDate });
    this.priceId = priceResponse.data;
    this.hutId = hutId;
});

Then('i should receive a response with an id', async function () {
    assert(this.priceId != null, "price id is null");
    assert(isValidUuid(this.priceId), "price id is not a valid uuid");
});

Then('a seasonal price should exist with the following information', async function (dataTable) {
    let expectedSeasonalPrice = dataTable.hashes()[0];

    let response = await this.client.get(`/prices/${this.priceId}`);
    let actualSeasonalPrice = response.data;

    assert(actualSeasonalPrice != null, "price data is null");
    assert.deepEqual(actualSeasonalPrice, expectedSeasonalPrice);
});

Then('the "xyz hut" has a seasonal price with the following information:', async function (dataTable) {
    let expectedSeasonalPrice = dataTable.hashes()[0];

    let response = await this.client.get(`/huts/${this.hutId}`);
    let actualSeasonalPrices = response.data.seasonalPrices;

    assert(actualSeasonalPrices.some(p => p.deepEqual(expectedSeasonalPrice)));
});

