# Scenario = Tab-under redirect

Seven modular Codex Agent Skills for affiliate prelanders and funnels, with reusable components, examples and functional/browser validation.

## For the team
Clone this private repository, then open it in Codex. The seven skills live under .agents/skills/.
To use them in another project, copy the seven skill directories into that project's .agents/skills/, retaining their sibling layout for the master and full QA harness. Start a new chat/reload discovery if needed.

| Skill | Job |
|---|---|
| $cookie-manager | Cookie lifecycle and optional returning-browser recognition |
| $gotooffer-tracking | One defined Go2Offer trigger, consent and deduplication |
| $swipe-interaction | Accessible swipe with a button alternative |
| $cloudflare-verification | Real Turnstile, server validation and trusted sessions |
| $offer-tab-router | Explicit offer navigation, optional B and same-tab fallback |
| $funnel-qa | Functional tests, browser checks, screenshots and reports |
| $affiliate-funnel-orchestrator | Select and integrate only the needed skills |

Example: $affiliate-funnel-orchestrator Build the full affiliate funnel using the required specialized skills. Keep it local until I authorize deployment.

- [Full usage and examples](.agents/skills/README.md)
- [Integration contracts](.agents/skills/affiliate-funnel-orchestrator/references/contracts.md)
- [Validation and limitations](.agents/skills/VALIDATION.md)
- [Complete file tree](FILE_TREE.txt)

## Reproduce
~~~sh
cd .agents/skills
npm ci
npx playwright install chromium
python -m pip install -r requirements-dev.txt
npm run test:unit
npm test
npm run validate
npm run test:siteverify
~~~
Official skill validation requires the installed skill-creator quick_validate.py; pass its actual path with npm run validate -- --official-validator /path/to/quick_validate.py.

## Release evidence
7/7 official skill checks, 41/41 unit tests, 18/18 Chromium scenarios and 3/3 official dummy-key Siteverify network probes passed. Independent invocation tests passed after demonstrated fixes.
Curated evidence is in evidence/; test reruns generate ignored reports under the QA skill.

Production Turnstile credentials, Meta/GTM remote receipt, advertiser conversions, Firefox/WebKit and real mobile devices were not tested. The local memory session store, demo consent UI and local HTTP settings require production adaptation.

## Boundaries
No production offer URL, account/Pixel ID or credential is supplied. A swipe is an interaction, a client cookie is untrusted, and Go2Offer/B navigation is not a conversion.
No deployment or live campaign mutation is authorized by these skills. A private repository requires collaborators to be invited separately.
No open-source license is assumed; choose a license before broader redistribution.
