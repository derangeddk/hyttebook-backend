Feature: Register hut
    As a user I want to register a hut

    Scenario: Register a hut
        Given I am authenticated as a user
        When I register a hut with the following information:
        | hutName | street      | streetNumber | city     | zipCode | email        | phone    | dayPrices           |
        | xyz hut | Kildemarken | 96           | Havdrup  | 4622    | xyz@mail.com | 74654010 | 1, 2, 3, 4, 5, 6, 7 |
        Then I should receive a response containing an id
        And a hut should exist with the following information:
        | id                | hutName | street      | streetNumber | city     | zipCode | email        | phone    |
        | "the return uuid" | xyz hut | Kildemarken | 96           | Havdrup  | 4622    | xyz@mail.com | 74654010 |
        And the hut "xyz hut" has the following default prices:
        | monday | tuesday | wednesday | thursday | friday | saturday | sunday |
        | 1      | 2       | 3         | 4        | 5      | 6        | 7      |
        And the hut should have a form
        And I should be admin of a hut named "xyz hut"
