# Sentinel's Journal

## 2024-05-22 - IDOR in Post Creation
**Vulnerability:** The `createPost` endpoint accepted `userId` from the request body without verification, allowing any user to create posts attributed to any other user (IDOR / Impersonation). The endpoint was also completely unauthenticated.
**Learning:** Developers often assume that if a parameter is present, it's correct. Also, relying on global middleware application in `app.js` can be risky if not all routes are covered; explicit middleware on routes is safer.
**Prevention:** Always derive the user identity from the trusted authentication token (`req.user.id`) rather than user input (`req.body.userId`) for resource creation. Verify route protection with explicit tests that attempt unauthorized access.

## 2024-05-22 - JWT Configuration & Testing Mismatch
**Vulnerability:** The `authenticateToken` middleware read `process.env.JWT_SECRET` at module load time, while tests set it at runtime. This caused tests to fail with "Invalid token" because the middleware was using the fallback secret while the token generator used the test secret.
**Learning:** Configuration that depends on environment variables should either be read at runtime (inside the function) or the environment must be fully configured before any code is loaded.
**Prevention:** Read sensitive configuration inside functions or ensure test setup files set environment variables before requiring the application.
