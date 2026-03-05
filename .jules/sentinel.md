## 2024-03-05 - [Critical] IDOR Vulnerability via Request Body Parameters
**Vulnerability:** The `createPost` endpoint relied on `req.body.userId` to determine the post author, allowing attackers to spoof posts as other users by changing the ID in the payload. Furthermore, the endpoint was unauthenticated.
**Learning:** Never trust client-provided data for identity determination. Identity should always be derived from a secure, tamper-proof source like the authentication token context (`req.user.id`). Unauthenticated routes should not perform actions on behalf of users.
**Prevention:** Always use `req.user.id` (populated by auth middleware) for resource creation, and ensure auth middlewares (`authenticateToken`) are consistently applied to all sensitive endpoints.
