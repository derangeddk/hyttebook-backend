(function() {
    let container = document.getElementById("hyttebook-include");

       let text = `
            <form>
                <div class="form-heading">
                    <h1>Book {{ hutName }}</h1>
                </div>

                <div class="form-field-column-container">
                    <div class="form-field-column">
                        <label v-if="showOrgType">
                            <span>Organisations type</span>
                            <select>
                                <option value="skole">Skole</option>
                            </select>
                        </label>

                        <label>
                            <span>Organisations navn</span>
                            <input type="text" name="form-org-name" placeholder="DDS" />
                        </label>

                        <label>
                            <span>Fornavn</span>
                            <input
                                type="text"
                                name="form-firstname"
                                required placeholder="Birgitte"
                            />
                        </label>

                        <label>
                            <span>Efternavn</span>
                            <input
                                type="text"
                                name="form-lastname"
                                required placeholder="Hansen"
                            />
                        </label>

                        <label>
                            <span>Adresse</span>
                            <input
                                type="text"
                                name="form-address"
                                required placeholder="Vejnavn og nr"
                            />
                        </label>

                        <label>
                            <span>Postnummer</span>
                            <input
                                type="text"
                                name="form-zipcode"
                                required placeholder="2500"
                            />
                        </label>

                        <label>
                            <span>By</span>
                            <input
                                type="text"
                                name="form-city"
                                required placeholder="Valby"
                            />
                        </label>

                        <label>
                            <span>Land</span>
                            <input
                                type="text"
                                name="form-country"
                                placeholder="Denmark"
                            />
                        </label>

                        <label>
                            <span>Telefon</span>
                            <input
                                type="text"
                                name="form-phone-number"
                            />
                        </label>

                        <label>
                            <span>Email</span>
                            <input
                                type="email"
                                required name="form-email"
                            />
                        </label>
                    </div>

                    <div class="form-field-column">
                        <label v-if="showBankDetails">
                            <span>Bank navn</span>
                            <input type="text" name="form-bank-name" placeholder="Nordea" />
                        </label>

                        <label v-if="showBankDetails">
                            <span>Reg. og kontonummer</span>
                            <div class="full-bank-account-number">
                                <input
                                    class="bank-account-registration-number"
                                    type="text"
                                    name="form-reg-number"
                                />
                                <input type="text" name="form-acc-number" />
                            </div>
                        </label>

                        <label v-if="showEan">
                            <span>EAN</span>
                            <input type="text" name="form-ean-number" />
                        </label>

                        <label v-if="showCleaningToggle">
                            <span>Rengøring ønskes</span>
                            <input
                                type="checkbox"
                                name="form-cleaning"
                            />
                        </label>

                        <label>
                            <span>Ankomst dato</span>
                            <input
                                type="date"
                                name="form-arrival-date"
                            />
                        </label>

                        <label v-if="showArrivalTime">
                            <span>Ankomst tid</span>
                            <input
                                type="time"
                                name="form-arrival-time"
                            />
                        </label>

                        <label>
                            <span>Afrejse dato</span>
                            <input
                                type="date"
                                name="form-departure-date"
                            />
                        </label>

                        <label v-if="showDepartureTime">
                            <span>Afrejse tid</span>
                            <input
                                type="time"
                                name="form-departure-time"
                            />
                        </label>
                    </div>
                </div>
                <button type="submit" class="submit-button">Send</button>
            </form>
        `;

        container.insertAdjacentHTML("afterbegin", text);
})();
