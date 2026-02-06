## 2026-01-26 - Critical Auth Vulnerabilities Fixed
**Vulnerability:**
1.  **Broken Auth Middleware:** The authentication middleware was looking for `decoded.userId` but the token payload contained `id`. It also tried to populate `req.user.username` but the model has `display_name`. This meant authentication was silently failing or returning 401 inappropriately for features that relied on it (messaging).
2.  **Unprotected Endpoints:** `post.routes.js` and `user.routes.js` were completely unprotected, allowing anyone to create posts (impersonating others via `userId` param) and search users.
3.  **Hardcoded Secret:** Middleware had a fallback hardcoded secret `your-super-secret-jwt-key-change-in-production`, which is a security risk.

**Learning:**
The middleware bug (mismatched property names) went unnoticed because unit tests might have been missing coverage for the real authentication flow. The unprotected routes were likely due to oversight. The `SequelizeConnectionRefusedError` in tests highlighted that the test environment configuration was also broken (trying to connect to Postgres instead of using SQLite/mock), which likely discouraged running tests frequently.

**Prevention:**
1.  Write integration tests that simulate the full request flow.
2.  Use consistent property names (e.g., `userId` vs `id`) across the stack.
3.  Fail fast if secrets are missing (do not use hardcoded fallbacks).
4.  Ensure test environment works out-of-the-box (e.g., using SQLite in-memory).
