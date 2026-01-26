## 2026-01-26 - Broken Access Control & Auth Middleware Mismatch
**Vulnerability:** Unauthenticated users could create posts as any user by providing `userId` in the request body. Also, authentication middleware was broken due to property mismatch (`decoded.id` vs `decoded.userId`).
**Learning:** Routes were completely unprotected, and the controller blindly trusted `req.body`. Middleware bug masked the issue by making legitimate requests fail (if it was applied).
**Prevention:** Apply `authenticateToken` to all write routes. Use `req.user.id` from token instead of request body. Verify token payload structure matches verification logic.

## 2026-01-26 - Hardcoded Secrets & Weak Passwords
**Vulnerability:** `JWT_SECRET` had a hardcoded fallback in the codebase, and passwords had no length validation.
**Learning:** Default values for secrets are dangerous even if intended for dev.
**Prevention:** Remove default values for secrets (Fail Closed). Enforce input validation (length/complexity) at the service layer.
