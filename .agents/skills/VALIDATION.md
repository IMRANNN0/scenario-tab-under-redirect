# Release validation
Date: 2026-11-02. Scope: the new reusable skills and isolated reference harness. No approved prelander, live campaign or deployment was modified.

| Check | Result |
|---|---|
| Installed skill-creator quick_validate.py | PASS, 7/7 skills |
| Local Markdown resource links and UI metadata | PASS, 7/7 skills |
| Node functional tests | PASS, 41/41 |
| Chromium desktop/mobile integration cases | PASS, 18/18 |
| Real Siteverify network requests with official dummy keys | PASS, 3/3: accept, reject, spent-token response |
| Independent component-skill invocation tests | PASS, 18/18 after repairs |
| Independent verification/orchestration/QA invocations | PASS, 5/5 after repairs |

The seven realistic invocation prompts covered all skill entrypoints. Independent evaluators used temporary workspaces, mock analytics/challenges and local/intercepted offer URLs. They did not modify source or send real tracking.

## Observed issues corrected
- Arrow-key increments previously reset the slider before completion; keyboard progress now accumulates.
- Consent/eligibility callback exceptions now fail closed without escaping dispatch.
- Router suppression is per logical action ID; a later genuine action is permitted.
- A B-only navigation failure does not permit another offer tab for the same action.
- The simulated cookie-rejection fixture now uses an isolated request because Playwright route.fetch populated the browser cookie jar before response headers were stripped.
- Ready-state controls were simplified and small-mobile clipping checked inside the dialog rectangle, not just against viewport width.

## Evidence and reproduction
Run npm test from this skills directory. Generated JSON, TAP and screenshots are under funnel-qa/reports and intentionally ignored as working output. The shared repository includes a curated evidence directory from this release, separate from the component source.
The browser suite uses desktop 1366x900, mobile touch 390x844 and small-mobile 360x740, Chromium with reduced motion. Pointer swipe, keyboard, touch, cancel/focus, consent, returning/expired/forged sessions, popup fallback, no-B repeated actions and broken local destinations are asserted.
Official validation used PyYAML 6.0.3 in an isolated temporary dependency directory. Teammates can install requirements-dev.txt and pass their installed official validator path.

## Known limitations and NOT_RUN
- No production Turnstile sitekey/secret was supplied. The official script integration is implemented; production widget acceptance and actual bot resistance are NOT_RUN. Local browser challenges are conspicuously mocked. Official dummy-key network tests are separate.
- Real Meta Events Manager receipt, a published GTM container, CAPI and advertiser installation/purchase confirmation are NOT_RUN. Unit tests assert adapters/payloads, not remote delivery.
- Firefox, WebKit/Safari, real mobile hardware and real privacy-policy cookie blocking are NOT_RUN. Cookie rejection is simulated.
- Memory sessions and event ledgers are local examples. Production requires a shared TTL session store, appropriate idempotency, rate limiting, HTTPS, application origin/CSRF controls, a real CMP and campaign-policy review.
- A new-tab handle and optional B navigation do not prove either page was viewed. Go2Offer in this reference means a navigation request.
- No universal exactly-once network delivery or 100% bot exclusion is claimed.
- GitHub sharing does not invite collaborators automatically. No open-source license is assumed.
