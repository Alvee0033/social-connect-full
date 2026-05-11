## 2024-05-24 - [IDOR in Post Creation and Missing Route Authentication]
**Vulnerability:** The `POST /api/posts` and `POST /api/posts/:id/react` endpoints lacked authentication middleware in the routes definition. Furthermore, the `createPost` controller implicitly trusted `req.body.userId`, allowing any user to potentially create posts masquerading as someone else (IDOR).
**Learning:** Controller logic alone is insufficient if the middleware protecting it is missing from the route. User-supplied identification data (like `userId` in the body) should never be trusted for actions linked to the authenticated user.
**Prevention:** Always verify that routes defining state-changing endpoints (POST, PUT, DELETE) have authentication middleware applied. Within controllers, always rely on `req.user.id` (set by the authentication middleware) to determine the user performing the action, rather than relying on the client to send a `userId`.

## 2024-05-24 - [Missing beforeUpdate hook for User Password]
**Vulnerability:** The User model only had a `beforeCreate` hook for hashing passwords. If a password update functionality is introduced in the future, the updated password would be stored in plaintext.
**Learning:** Always implement `beforeUpdate` alongside `beforeCreate` hooks for password hashing to ensure consistent protection across the entire lifecycle of the user model.
**Prevention:** Include both `beforeCreate` and `beforeUpdate` hooks when defining models with sensitive data that requires transformations like hashing.
