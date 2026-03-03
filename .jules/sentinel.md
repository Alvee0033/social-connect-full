## 2024-05-18 - [CRITICAL] Insecure Direct Object Reference in Post Creation
**Vulnerability:** IDOR in post creation allowing arbitrary users to create posts on behalf of others by supplying `userId` in the request body.
**Learning:** `req.body.userId` should not be trusted for resource creation where the resource is tied to the authenticated user.
**Prevention:** Always use `req.user.id` (populated by authentication middleware) instead of relying on `userId` from the request body. Ensure the endpoints modifying or creating resources tied to users are protected by authentication middleware.