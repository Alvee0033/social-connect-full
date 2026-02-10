## 2024-05-22 - Hardcoded Secret Fallback & Auth Logic Mismatch
**Vulnerability:** The application used a hardcoded fallback string for `JWT_SECRET` in `auth.middleware.js` if the environment variable was missing. Additionally, the middleware expected `decoded.userId` but the token contained `decoded.id`.
**Learning:** Hardcoded fallbacks in middleware can mask configuration errors (missing env vars) and leave the application vulnerable to token forgery if the default secret is known. The logic mismatch indicates a lack of integration testing for protected routes.
**Prevention:** Always throw an error if critical security configuration (like secrets) is missing. Ensure integration tests cover the full authentication flow (login -> access protected route).
