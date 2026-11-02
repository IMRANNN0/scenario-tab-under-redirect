# Validation matrix
Prompt: `$funnel-qa Test the full funnel.`

| Component | Required observations |
|---|---|
| Cookie | CRUD, encoding, session/persistent lifetime, new/returning, deleted/expired, blocked storage, consent |
| Tracking | one trigger/owner, stable ID, duplicate/reentrant suppression, SDK error, consent/eligibility |
| Swipe | pointer/touch full and partial drags; tap/Enter/Space alternative (integrated or separate); pointercancel; repeat prevention; Escape/backdrop or approved close controls; dialog focus; mobile overflow |
| Verification | missing/invalid token, hostname/action/origin, success/failure, replay, timeout, server expiry, rotation/revoke, forged cookie |
| Router | offer URL/query, new tab, opener null, B/no B, blocked same-tab fallback, modifiers, exception, actual broken response |
| Combined | no automatic offers, session skip/rechallenge, only one Go2Offer, no B reload event, no event without consent |

Run from the skills root:
- npm test (requires Playwright plus Chromium; saves reports/screenshots)
- npm run test:unit (Node built-ins only)
- npm run test:siteverify (external official dummy-key probe)
- npm run validate -- --official-validator /path/to/skill-creator/scripts/quick_validate.py

Install a supported Node 22+ runtime and Python 3 with PyYAML for the official validator. Playwright is pinned in package.json. Use npm install and npx playwright install chromium in your own checkout. Alternatively set PLAYWRIGHT_MODULE to an existing trusted module directory, and CHROMIUM_EXECUTABLE_PATH to an installed browser executable. Do not silently fetch an unknown executable.
Reports: unit.tap, summary.json, browser.json/browser.md, screenshots and siteverify-network.json. PASS means only the asserted local condition. NOT_RUN is never promoted to PASS.
The shipped reference tests use a local mock challenge; no production campaign or Meta traffic is sent. The network probe is separate.
Choose swipe selectors/assertions from the actual approved presentation: do not require visible Cancel/× or a separate range/button when the user selected a unified CTA. With server redirects, use a local final offer fixture; interception of the initial browser request may not cover the redirected external URL.
Manually inspect screenshots and keyboard focus. Add Firefox/WebKit/real-device cases when those environments are available. Cookie rejection is simulated by stripping Set-Cookie and blocking script storage; real browser privacy modes need their own run.
