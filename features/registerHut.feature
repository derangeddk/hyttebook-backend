Feature: Register hut
    As a user I want to register a hut

    Scenario: Register a hut
        Given I am authenticated as a user
        When I register a hut with the following information:
        | hutName | street      | streetNumber | city     | zipCode | email        | phone    | price         |
        | xyz hut | Kildemarken | 96           | Havdrup  | 4622    | xyz@mail.com | 74654010 | 1,2,3,4,5,6,7 |
        Then I should receive a response containing an id
        And a hut should exist with the following information:
        | id                | hutName | street      | streetNumber | city     | zipCode | email        | phone    | price     |
        | "the return uuid" | xyz hut | Kildemarken | 96           | Havdrup  | 4622    | xyz@mail.com | 74654010 | "priceId" |
        And the hut should have a form
        And the hut should have the specified price for each day in the week
        And I should be admin of a hut named "xyz hut"

