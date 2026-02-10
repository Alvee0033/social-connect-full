# Sentinel's Journal

## 2024-05-23 - Hardcoded JWT Secret
**Vulnerability:** A hardcoded fallback value was used for `JWT_SECRET` in `backend/src/middleware/auth.middleware.js`, allowing potential token forgery if the environment variable was missing.
**Learning:** Default values for critical secrets can silently mask configuration errors and create backdoors. Tests were passing despite missing environment variables because of this fallback.
**Prevention:** Remove fallback values for secrets. Throw a fatal error during application startup if required secrets are missing. Ensure test environments explicitly set these variables.
