Feature: Inject bookingform
    As an administrator a user wants to inject their hut's form on their hut's website so bookings can be handled in Hytte Index

    Scenario: Inject a form
        Given the hut has a form
        When the hut's website requests a form with a uuid
        Then the request should be successful
