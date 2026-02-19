## 2024-05-25 - IDOR in Resource Creation and Auth Middleware Bug

**Vulnerability:** IDOR (Insecure Direct Object Reference) in `createPost` API.
**Learning:** The controller accepted `userId` from the request body without validation, allowing any authenticated user to create resources on behalf of another user. Additionally, the existing authentication middleware was buggy (expecting `decoded.userId` but token contained `id`) and was not applied to sensitive routes. This highlights a pattern where security middleware might exist but remain unused or broken due to lack of testing.
**Prevention:**
1.  **Always use `req.user.id`** from verified JWT tokens for resource creation, never trust `req.body.userId`.
2.  **Verify middleware logic** matches the token generation logic (e.g., payload keys).
3.  **Apply authentication middleware** to all state-changing routes by default.
