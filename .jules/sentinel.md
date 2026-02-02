## 2024-05-22 - Broken Access Control in Post Creation
**Vulnerability:** The `createPost` endpoint relied on `userId` from the request body without verifying it matched the authenticated user, allowing impersonation.
**Learning:** Middleware alone isn't enough; controllers must explicitly use trusted sources (like `req.user`) for ownership. Also discovered a mismatch between token signing (id) and verification (userId) logic.
**Prevention:** Always derive user identity from the authentication token, never from client input. Ensure token payload structure is consistent between producer (auth service) and consumer (middleware).
