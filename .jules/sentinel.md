# Sentinel Journal

## 2024-05-22 - Token Payload Mismatch & IDOR
**Vulnerability:** IDOR in post creation allowed impersonation. Also found that Authentication was completely broken due to a mismatch between token generation (`{ id }`) and verification (`decoded.userId`).
**Learning:** Broken authentication mechanisms can mask other vulnerabilities (like IDOR) or be masked by environment issues (like DB connection failures in tests). Tests were not running, so the broken auth was unnoticed.
**Prevention:** Ensure integration tests cover the full authentication flow (login -> use token) and that tests run in CI/CD. Use consistent naming for user ID in token payloads (e.g., always `id` or always `sub`).
