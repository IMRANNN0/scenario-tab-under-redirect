---
name: affiliate-funnel-claude
description: Coordinate reusable affiliate prelander workflows for cookies, swipe UI, Cloudflare verification, offer routing, event tracking, and funnel QA. Use for the requested components of an affiliate funnel, without assuming production credentials or deployment permission.
---

# Affiliate funnel skill bundle

This bundle contains seven reusable component skills. Select the components the user actually needs; do not activate the whole funnel for one isolated change. Read the selected `SKILL.md` files and their linked resources from this bundle before working:

| Need | Instructions |
|---|---|
| Coordinate an explicitly requested multi-component funnel | [affiliate-funnel-orchestrator](components/affiliate-funnel-orchestrator/SKILL.md) |
| Cookies and remembered interactions | [cookie-manager](components/cookie-manager/SKILL.md) |
| Accessible swipe UI | [swipe-interaction](components/swipe-interaction/SKILL.md) |
| Cloudflare Turnstile and server verification | [cloudflare-verification](components/cloudflare-verification/SKILL.md) |
| User-initiated offer and optional B navigation | [offer-tab-router](components/offer-tab-router/SKILL.md) |
| GoToOffer measurement and deduplication | [gotooffer-tracking](components/gotooffer-tracking/SKILL.md) |
| Tests and evidence | [funnel-qa](components/funnel-qa/SKILL.md) |

The component folders remain siblings under `components/` so their relative references work. The examples and scripts are starting points to adapt to the user's actual environment, permissions and available tools. Ask for critical missing configuration rather than inventing identifiers. A swipe is not trusted verification, and a GoToOffer event is not an advertiser conversion. Follow the user's actual scope and avoid live campaign changes unless authorized.
