# Scenario = Tab-under redirect
Seven independently invocable Codex Agent Skills for affiliate prelanders and funnels. The master coordinates only the components a request needs. This is reusable tooling, not permission to modify live campaigns.

## Start with one skill
| Request | Invoke |
|---|---|
| Returning-browser cookies | $cookie-manager |
| Go2Offer without duplicates | $gotooffer-tracking |
| Swipe popup with button alternative | $swipe-interaction |
| Real Turnstile and trusted sessions | $cloudflare-verification |
| Offer in new tab; replace original A with B | $offer-tab-router |
| Test a component or full funnel | $funnel-qa |
| Build an explicitly requested full funnel | $affiliate-funnel-orchestrator |

Example prompts:
- `$cookie-manager Add cookie support for returning visitors. Ask me for retention if not configured.`
- `$gotooffer-tracking Add Go2Offer tracking without duplicates. Use our approved single trigger and CMP.`
- `$swipe-interaction Create a swipe-to-continue popup with a keyboard/button alternative.`
- `$cloudflare-verification Add real Turnstile verification to this existing backend.`
- `$offer-tab-router Open the offer in a new tab and replace the original Prelander A with B.`
- `$funnel-qa Test the full funnel and report untested cases.`
- `$affiliate-funnel-orchestrator Build the full affiliate funnel using only the required specialized skills.`

## Share and install
Share this repository without campaign source, credentials, private offer links or account IDs.
Place the seven directories under the target repository's .agents/skills/. Keep their relative layout for the master and integrated example. Then reopen/start a Codex chat in that repository so the skill catalog can discover them.
A single specialized skill can be copied alone with its own assets/references/tests; sibling links are only needed for integrated work. The complete local QA harness depends on the sibling templates.
Repository sharing does not automatically install skills for another team member or grant them private GitHub access.

## Contracts and safeguards
Read [integration contracts](affiliate-funnel-orchestrator/references/contracts.md) before combining components.
- Cookie identity and verified status are separate. q=yes is an editable hint.
- Turnstile always needs server-side Siteverify and server-validated session state.
- Swipe is interaction, not a bot-proof check.
- CTA_Click, VerificationSuccess, Go2Offer and advertiser Conversion are distinct.
- Go2Offer has one configured trigger. Do not also fire from B reload.
- Use one browser analytics owner. Consent is an input to the real integration.
- New tab behavior requires explicit activation and a normal same-tab fallback.
- B navigation is not proof of offer viewing or conversion.
- No deployment, campaign edits or secret provisioning is performed by these templates.

## Run validation
From this skills directory:
```sh
npm install
npx playwright install chromium
python -m pip install -r requirements-dev.txt
npm run validate
npm run test:unit
npm test
npm run test:siteverify
```
The official skill validator comes from your installed skill-creator. If absent, pass --official-validator /actual/path/quick_validate.py; a missing official validator is reported NOT_RUN and exits nonzero.
The test suite uses built-in Node tests, Playwright/Chromium and local fixtures. No real affiliate or analytics traffic is sent. The last command separately calls Cloudflare with official public dummy secrets.
Optional trusted existing browser/module paths are supported; see [QA matrix](funnel-qa/references/matrix.md).
See [VALIDATION.md](VALIDATION.md) for this release's actual results, limitations and invocation evaluation.

## Real widget reference
Supply TURNSTILE_SITEKEY and TURNSTILE_SECRET in the server environment; supply OFFER_URL or explicitly set LOCAL_DEMO=1 for a local destination.
```sh
node affiliate-funnel-orchestrator/assets/reference-funnel/server.mjs
```
This localhost learning harness is not a production server. Its memory sessions, local HTTP cookie and demo consent checkbox must be adapted to the existing backend, HTTPS, shared TTL sessions and CMP. Production keys, remote receipt, actual ad policy approval and advertiser conversion checks are never invented.

## Layout
Each named skill has SKILL.md, agents/openai.yaml and a focused reference. Component assets are ready to copy/adapt. Unit tests live with their component; shared browser/router tests and reports belong to funnel-qa. The orchestrator contains the integration example rather than making unrelated skills depend on its workflow.

## Maintenance
Update one responsibility at a time. Change event meaning and tests together. Review official provider docs when adapting APIs. Keep account-specific configuration out of shared examples. No open-source license is assumed; the owner should choose a license before broader redistribution.
