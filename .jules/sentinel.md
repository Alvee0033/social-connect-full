## 2025-05-15 - [Critical Auth Mismatch and IDOR]
**Vulnerability:**
1.  **Auth Mismatch:** `auth.service.js` generated tokens with `id` payload, but `auth.middleware.js` expected `userId`. This rendered authentication broken or silently failing.
2.  **IDOR:** `createPost` blindly trusted `req.body.userId`, allowing any user to post as any other user.
**Learning:**
Authentication logic was split between service and middleware with mismatched expectations. The lack of integration tests for *protected* routes (only login/register were tested) allowed this gap to persist.
**Prevention:**
Always use `req.user.id` from trusted middleware for resource creation. Verify token payload structure matches middleware expectations. Add integration tests for protected routes.
