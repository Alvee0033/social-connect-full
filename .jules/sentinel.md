## 2024-05-24 - [IDOR in Post Creation and Missing Route Authentication]
**Vulnerability:** The `POST /api/posts` and `POST /api/posts/:id/react` endpoints lacked authentication middleware in the routes definition. Furthermore, the `createPost` controller implicitly trusted `req.body.userId`, allowing any user to potentially create posts masquerading as someone else (IDOR).
**Learning:** Controller logic alone is insufficient if the middleware protecting it is missing from the route. User-supplied identification data (like `userId` in the body) should never be trusted for actions linked to the authenticated user.
**Prevention:** Always verify that routes defining state-changing endpoints (POST, PUT, DELETE) have authentication middleware applied. Within controllers, always rely on `req.user.id` (set by the authentication middleware) to determine the user performing the action, rather than relying on the client to send a `userId`.
## 2024-05-24 - [Information Disclosure in User Search]
**Vulnerability:** The `/api/users/search` endpoint returned a list of users matching a query and included their `email` addresses in the JSON response. Furthermore, the endpoint was completely unauthenticated, allowing any anonymous user to scrape user emails by trying different query strings.
**Learning:** Endpoints returning lists of user objects must carefully select which attributes to return. The default behavior (or poorly configured explicit attributes) can easily leak PII (Personally Identifiable Information) like email addresses, phone numbers, or physical addresses.
**Prevention:**
1. Always explicitly define the `attributes` array in Sequelize queries that return user data to the client, ensuring sensitive fields like `email`, `password`, and internal tokens are excluded.
2. Ensure all endpoints that expose user data, even minimal public profiles, have at least basic authentication applied (`authenticateToken`) to prevent unauthenticated scraping.
