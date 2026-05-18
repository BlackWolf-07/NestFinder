# NestFinder API Documentation

All API endpoints are prefixed with `/api`.

## Authentication

-   `POST /auth/register`: Create a new user account.
-   `POST /auth/login`: Authenticate a user and receive a JWT.
-   `GET /auth/me`: Get current user details (Requires Token).

## Properties

-   `GET /properties`: Get all properties (Paginated, Filters supported).
-   `GET /properties/:id`: Get property details.
-   `POST /properties`: Create a new property (Requires Token, Owner/Admin).
-   `PATCH /properties/:id`: Update a property (Requires Token, Owner/Admin).
-   `DELETE /properties/:id`: Delete a property (Requires Token, Owner/Admin).
-   `GET /properties/my-properties`: Get properties listed by the current user (Requires Token).

## Favorites

-   `GET /favorites`: Get current user's favorite properties (Requires Token).
-   `POST /favorites`: Add a property to favorites (Requires Token).
-   `DELETE /favorites/:propertyId`: Remove a property from favorites (Requires Token).

## Bookings

-   `POST /bookings`: Schedule a property visit (Requires Token).
-   `GET /bookings`: Get bookings for the current user (Requires Token).
-   `PATCH /bookings/:id/status`: Update booking status (Requires Token, Owner/Admin).

## AI Features

-   `POST /ai/chat`: Chat with the AI property assistant.
-   `GET /ai/recommendations`: Get AI-powered property recommendations (Requires Token).

## Admin

-   `GET /admin/stats`: Get platform statistics (Requires Token, Admin).
-   `GET /admin/pending-properties`: Get properties awaiting approval (Requires Token, Admin).
-   `PATCH /admin/properties/:id/approve`: Approve or reject a property (Requires Token, Admin).
-   `PATCH /admin/properties/:id/verify`: Toggle verification status (Requires Token, Admin).
-   `GET /admin/reports`: Get all reported listings (Requires Token, Admin).
-   `PATCH /admin/reports/:id/resolve`: Resolve a report (Requires Token, Admin).

## Reviews & Reports

-   `GET /reviews/:propertyId`: Get reviews for a property.
-   `POST /reviews`: Add a review (Requires Token).
-   `POST /reports`: Report a property listing (Requires Token).
