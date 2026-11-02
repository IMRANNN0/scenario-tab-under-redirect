---
name: affiliate-funnel-orchestrator
description: Coordinate specialized skills for an explicitly requested multi-component affiliate funnel. Select only needed cookie, tracking, swipe, Turnstile, routing and QA skills; do not activate for one isolated component task.
---

# Affiliate Funnel Orchestrator

Own the integration plan and boundaries, not specialized component internals.
## Prepare
Inspect repository instructions, approved assets/templates and the actual current journey. Identify target pages and authorized changes. Reuse assets without modifying unrelated projects. In this repository, single-hero preferences and the Opera lock remain; creating a library authorizes no live page edits.
Write an input manifest and plan: target, approved offer/B URLs, actions, verification TTL, optional recognition-cookie retention/consent, event name/trigger/payload/owner/IDs, eligibility and deployment scope. Clarify critical unknowns while doing independent local work.
## Select
Read selected sibling SKILL.md files; do not load all for isolated work.
| Need | Skill |
|---|---|
| Browser recognition/preferences | [cookie-manager](../cookie-manager/SKILL.md) |
| Measurement/deduplication | [gotooffer-tracking](../gotooffer-tracking/SKILL.md) |
| Optional swipe/button UI | [swipe-interaction](../swipe-interaction/SKILL.md) |
| Real challenge/trusted sessions | [cloudflare-verification](../cloudflare-verification/SKILL.md) |
| Offer/optional B navigation | [offer-tab-router](../offer-tab-router/SKILL.md) |
| Component/integrated checks | [funnel-qa](../funnel-qa/SKILL.md) |
## Integrate
Read [references/contracts.md](references/contracts.md). Reference path: CTA, backend session check, Turnstile only when unverified, Siteverify, protected session, fresh explicit Continue, single defined Go2Offer and navigation. Swipe is optional interaction, not verification.
[assets/reference-funnel/server.mjs](assets/reference-funnel/server.mjs) integrates the sibling templates as a local learning/test harness. Adapt components into the real stack; do not deploy this local memory-store server unchanged.
Never open a tab from an asynchronous verification callback. Preserve links/fallbacks. For an explicitly requested A-to-B GoToOffer, carry a per-action handoff and qualify B before dispatch; do not fire separately on A. B views are independent; neither B nor verification proves advertiser conversion. See the conditional B-load contract in the tracking skill.
## Validate and deliver
Invoke funnel-qa for selected components and the journey. Fix demonstrated failures, preserve NOT_RUN results, and supply configuration/reproduction instructions. Do not silently provision secrets, deploy or mutate campaigns.
