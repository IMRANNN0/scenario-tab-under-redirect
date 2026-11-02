# Scenario = Tab-under redirect

Seven modular Codex Agent Skills for affiliate prelanders and funnels, with reusable components, examples and functional/browser validation.

## For the team
Clone this repository, then open it in Codex. The seven skills live under .agents/skills/.
To use them in another project, copy the seven skill directories into that project's .agents/skills/, retaining their sibling layout for the master and full QA harness. Start a new chat/reload discovery if needed.

Or paste this prompt into Codex to install all seven skills from this repository:

```text
Use $skill-installer to install all seven skills from https://github.com/IMRANNN0/scenario-tab-under-redirect: affiliate-funnel-orchestrator, cloudflare-verification, cookie-manager, funnel-qa, gotooffer-tracking, offer-tab-router, and swipe-interaction. Each skill is under .agents/skills/<skill-name>. After installation, tell me to start a new Codex chat.
```

## Claude Code

In Claude Code, paste this prompt:

```text
Clone https://github.com/IMRANNN0/scenario-tab-under-redirect to a temporary folder.
Install the seven skills for my user by running node scripts/install-claude-skills.mjs --user
from the cloned repository. Do not overwrite any existing skills. Tell me how to
start a new Claude Code session and find the skills with /skills.
```

The installer requires Node.js and Git. For one project only, run it with `--project` from that project's root using the install script's path. To invoke a skill in Claude Code, use e.g. `/gotooffer-tracking`. Claude Code discovers the personal and project skill directories described in its [skills documentation](https://code.claude.com/docs/en/skills).

## Claude web and desktop

Download [the Claude upload bundle](releases/affiliate-funnel-claude.zip). In Claude, enable file creation/code execution if needed, go to **Customize > Skills**, choose **Create skill > Upload a skill**, and upload the ZIP. This creates one combined `affiliate-funnel-claude` skill that contains all seven component workflows. The bundle contains instructions and examples; access to local projects and tools depends on the Claude environment. See [Claude's skill upload guide](https://support.claude.com/en/articles/12512180-use-skills-in-claude).

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
The original release recorded 7/7 official skill checks, 41/41 unit tests, 18/18 Chromium scenarios and 3/3 official dummy-key Siteverify network probes. See the validation commands for the current revision.
Curated evidence is in evidence/; test reruns generate ignored reports under the QA skill.

Production Turnstile credentials, Meta/GTM remote receipt, advertiser conversions, Firefox/WebKit and real mobile devices were not tested. The local memory session store, demo consent UI and local HTTP settings require production adaptation.

## Boundaries
No production offer URL, account/Pixel ID or credential is supplied. A swipe is an interaction, a client cookie is untrusted, and Go2Offer/B navigation is not a conversion.
No deployment or live campaign mutation is authorized by these skills.
No open-source license is assumed; choose a license before broader redistribution.
