
## 2024-05-20 - [Hardcoded JWT Secret Fallback]
**Vulnerability:** A hardcoded fallback value (`'your-super-secret-jwt-key-change-in-production'`) was used for the JWT secret in `backend/src/middleware/auth.middleware.js`.
**Learning:** Hardcoded fallbacks in production logic, even with comments like "change in production", often end up being used in real environments if configuration management fails. This allows attackers to forge valid JWT tokens and completely compromise authentication.
**Prevention:** Remove fallback values for critical secrets. The application must fail securely (e.g., return a 500 error or fail to start) if required secrets are not present in the environment configuration.
