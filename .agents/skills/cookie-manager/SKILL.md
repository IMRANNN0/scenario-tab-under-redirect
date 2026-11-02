---
name: cookie-manager
description: Create or repair configurable website cookies, browser recognition, or remembered completion of an interaction such as a swipe. Use for cookie CRUD, expiration and scope; use cloudflare-verification for trusted verification sessions.
---

# Cookie Manager

Own cookie storage and lifecycle; verification, navigation and analytics are separate.
- Inspect the target's cookie/CMP implementation and approved scope. Determine purpose, name, lifetime in seconds, fixed versus rolling expiry, domain/path and consent category. Do not invent production identifiers or retention.
- Adapt [assets/cookies.mjs](assets/cookies.mjs). It supports read/create/update/delete, session and persistent cookies. Copy only the requested component.
- Call visitor recognition with the actual consent decision. A returning browser has an identifier present before this visit's write. Preserve that identifier when refreshing expiry. Handle blocked storage without breaking ordinary navigation.
- To remember completion of a swipe or other UI action, adapt [assets/swipe-memory.mjs](assets/swipe-memory.mjs): require the actual consent decision and an explicit retention setting, write only after completion, and remove on withdrawal. Whether a remembered action changes a future journey must be requested or otherwise established; a client cookie is editable and proves neither verification nor humanity.
- When the user explicitly directs cookie storage without adding a consent choice and no consent mechanism exists, record that scoped choice accurately; do not report that visitor consent was obtained. The helper's `allowWithoutConsent` option is an explicit opt-in for that instruction, not a default for other tasks.
- Prefer host-only cookies. Use Path=/ only for intended site-wide sharing, Secure on HTTPS and an appropriate SameSite policy. JavaScript cannot set/read HttpOnly cookies: use a backend response.
- A q=yes flag can illustrate prior client state, but users can edit it. It cannot grant verified status. Use an opaque session identifier checked against server-side state for trust.
- Delete with the same name/domain/path and Max-Age=0. Trusted-session revocation also requires invalidating backend state.
- Test missing/present/expired/deleted/disabled cookies, consent denial, encoding and invalid settings.
Read [references/usage.md](references/usage.md) for usage and scope. Run `node --test assets/tests/cookies.test.mjs` here. Browser checks are in funnel-qa; basic cookie work does not require other skills.
