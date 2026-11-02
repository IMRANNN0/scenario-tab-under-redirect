# Browser validation

PASS: 18/18

- PASS: desktop button new tab B and no reload duplicates
- PASS: desktop completed pointer swipe
- PASS: keyboard range and offer navigation
- PASS: keyboard arrow increments accumulate
- PASS: mobile touch swipe and responsive layout
- PASS: partial swipe cancel Escape and focus restoration
- PASS: small mobile ready actions fit the dialog
- PASS: popup blocked standard same tab fallback
- PASS: optional B absent preserves original tab
- PASS: no B allows a second distinct explicit action
- PASS: consent denial allows navigation without analytics
- PASS: verification failure then successful retry
- PASS: returning session skips unnecessary challenge
- PASS: visitor cookie existing expired and deleted
- PASS: expired server session requires re-verification
- PASS: forged q yes and invalid session do not authorize
- PASS: simulated cookie rejection fails closed
- PASS: broken offer is observed as HTTP 404

NOT_RUN: Firefox; WebKit/Safari; production Turnstile widget; Meta Events Manager receipt; GTM published container; real advertiser conversion; real browser cookie-blocking policy (rejection was simulated)
