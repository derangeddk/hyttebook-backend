Feature: Register hut
    As a user I want to register a hut

    Scenario: Register a hut
        Given I am authenticated as a user
        When I register a hut with the following information:
        | hutName | street      | streetNumber | city     | zipCode | email        | phone    |
        | xyz hut | Kildemarken | 96           | Havdrup  | 4622    | xyz@mail.com | 74654010 |
        Then I should receive a response containing an id "5d539311-9701-4ab4-9074-a4f087aa5bad"
