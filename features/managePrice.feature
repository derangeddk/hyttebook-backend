Feature: Manage price
    As a user I want to add a seasonal price for my hut

    Scenario: Succesfully add a seasonal price for a hut
        Given I have registered a hut with id xyz
        When I add a seasonal price with the following information:
        | hutId | dayPrices           | startDate | endDate |
        | "xyz" | 1, 2, 3, 4, 5, 6, 7 | 01/05     | 01/09   |
        Then i should receive a response with an id
        And a seasonal price should exist with the following information
        | startDate | endDate | monday | tuesday | wednesday | thursday | friday | saturday | sunday |
        | 01/05     | 01/09   | 1      | 2       | 3         | 4        | 5      | 6        | 7      |
        And the "xyz hut" has a seasonal price with the following information:
        | startDate | endDate | monday | tuesday | wednesday | thursday | friday | saturday | sunday |
        | 01/05     | 01/09   | 1      | 2       | 3         | 4        | 5      | 6        | 7      |
