## 2024-05-24 - Hardcoded Secret Fallback & Broken Auth Logic
**Vulnerability:** The authentication middleware contained a hardcoded fallback for `JWT_SECRET` and a logic error (`decoded.userId` vs `decoded.id`) that would have prevented valid authentication even if the secret was correct. Additionally, sensitive post-creation routes lacked authentication entirely.
**Learning:** Hardcoded fallbacks in middleware can silently mask configuration errors (missing env vars) while introducing critical vulnerabilities. The logic error suggests the code was never properly tested with authentication enabled.
**Prevention:** Fail fast and hard if security configuration (like `JWT_SECRET`) is missing. Ensure unit tests cover the actual middleware logic, not just the happy path of the controller.
