## 2024-05-22 - Hardcoded JWT Secret and Broken Auth Middleware
**Vulnerability:** A hardcoded fallback secret ('your-super-secret-jwt-key-change-in-production') was present in the authentication middleware. Additionally, the middleware was checking `decoded.userId` while the token generator was signing `{ id }`, causing legitimate authentication to fail.
**Learning:** Hardcoded fallbacks, even if intended for development, are critical risks. Inconsistent property usage (`id` vs `userId`) in JWT payloads can break authentication flow.
**Prevention:** Strictly enforce environment variables for secrets (fail start if missing). Verify token payload structure matches between signing and verifying logic.
