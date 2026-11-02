# Real verification integration
Prompt: `$cloudflare-verification Add real Turnstile verification.`
Recheck [client rendering](https://developers.cloudflare.com/turnstile/get-started/client-side-rendering/), [Siteverify](https://developers.cloudflare.com/turnstile/get-started/server-side-validation/), [testing](https://developers.cloudflare.com/turnstile/troubleshooting/testing/) before adapting. Sources consulted 2026-11-02.

## Backend contract
POST /api/verify accepts JSON {token}; verify the request's allowed Origin and your CSRF policy. Call createVerificationService with server-only secret, exact hostnames/action, allowedOrigins, store and TTL. Set result.setCookie as a response header; never return it in JSON. Return only verified/expiresAt and safe error codes.
GET /api/session reads the session cookie and uses service.status; do not cache this response in browser/CDN.
POST /api/logout revokes server state and expires the matching cookie. Protect all mutation endpoints and implement rate limits.
No browser endpoint may read TURNSTILE_SECRET, server storage, raw session ID or token logs.

## Server storage
The adapter implements async get(hashedId), set(hashedId,{action,expiresAt}), delete(hashedId). Store records server-side and enforce expiration on every read. The example hashes random 256-bit session IDs. The local Map is bounded and process-local; replace it with a consistent shared TTL store for production. Session fixation is prevented by rotating IDs on successful verification. Logout must affect the same shared store.
Default production cookie: __Host-aff_verified; Path=/; Secure; HttpOnly; SameSite=Lax. Use HTTPS. Local HTTP test harness deliberately uses a different unprefixed cookie and secure=false. Never copy that development relaxation to production.
A valid session may skip a new challenge during the explicitly configured verification TTL. It is independent of one-year recognition cookies and is revoked/expired server-side.

## Lifecycle
The client uses the official script https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit and submits only the generated token to the same-origin backend. Require a cookie round trip to /api/session after server acceptance. If cookies are disabled, show a recoverable error; do not fall back to q=yes.
Tokens are single-use and expire after 300 seconds; Siteverify returns timeout-or-duplicate for expired/reused tokens. Reset the proper widget after submission and allow an explicit retry. Client token expiry does not automatically revoke an independently established server session.
The server validates strict success/action/hostname. Transport retries are bounded to two and reuse one idempotency key. Challenge failures need a fresh token, not an automatic resubmit loop. Missing secret/hostname/action is a configuration error, not a successful bypass.
Wire production in the existing stack. This library's Node template is not a Cloudflare Worker bundle; Workers need Web Crypto and a chosen durable storage adapter. Secret provisioning and deployment are separate authorized work.

## Tests
Unit mocks test validation, session behavior and failures without Cloudflare traffic. funnel-qa's siteverify-probe uses only Cloudflare's public dummy secrets; dummy acceptance proves endpoint contract, not production bot resistance. Actual production acceptance requires a real widget/sitekey/secret and controlled success/replay checks.
