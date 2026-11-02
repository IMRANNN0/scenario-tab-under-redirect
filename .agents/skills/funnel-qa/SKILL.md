---
name: funnel-qa
description: Test affiliate funnel components or an integrated journey with automated assertions, desktop/mobile browser evidence, screenshots and PASS/FAIL reports. Use for validation without mutating campaigns or sending real tracking by default.
---

# Funnel Qa

Own validation and evidence, not campaign redesign.
1. Identify target, event contract, allowed side effects and browser matrix. Inspect unfamiliar scripts first. For live tests intercept advertiser/analytics requests unless real sends are explicitly authorized.
2. Read [references/matrix.md](references/matrix.md). Run selected component tests and the actual integrated flow. Entry: `node funnel-qa/scripts/run.mjs` from the parent skills folder. --unit-only explicitly omits browser coverage.
3. [scripts/browser.mjs](scripts/browser.mjs) exercises the isolated reference funnel with clearly labelled local verification fixtures and offer destinations. It does not prove production Turnstile or platform receipt.
4. Adapt cases to actual selectors/endpoints without changing target semantics. Cover first/returning visitors, present/missing/expired/deleted/disabled cookies, consent, success/failure/replay, canceled swipe, popup/new-tab/same-tab modes, duplicate events, B reload and broken URLs.
5. Capture screenshots, errors, statuses and destinations. PASS requires executed assertions; FAIL identifies a failed assertion; NOT_RUN identifies unavailable dependencies/credentials/browsers. Exit nonzero when required checks fail or cannot run.
6. Inspect screenshots for clipping, readable copy and visible actions. Automation establishes neither conversion performance, complete accessibility compliance nor platform approval.
Use [scripts/siteverify-probe.mjs](scripts/siteverify-probe.mjs) only for official dummy-key network checks. Never log real secrets/tokens. Read reports before summarizing and preserve untested conditions.
