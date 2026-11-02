---
name: gotooffer-tracking
description: Implement or debug configurable Go2Offer custom events, GTM or Meta Pixel dispatch, consent gating and duplicate prevention. Use for funnel measurement, not navigation, verification or advertiser conversion claims.
---

# Gotooffer Tracking

Own event definitions, dispatch and deduplication.
1. Inspect existing tags, consent and dispatch owners. Write the contract first: name, meaning, exactly one trigger, eligibility, payload, event ID and deduplication scope. Preserve requested spelling, including GoToOffer versus Go2Offer.
2. Distinguish CTA_Click (intent), VerificationSuccess (server acceptance), Go2Offer (the defined offer action) and confirmed advertiser Conversion. A swipe, B load or navigation request proves no installation, purchase or offer view.
3. Adapt [assets/tracking.mjs](assets/tracking.mjs). Generate one ID per logical action; reuse it on retries. New genuine actions get new IDs. Its in-memory ledger protects one runtime; use shared/durable idempotency for cross-runtime guarantees.
4. Choose GTM dataLayer OR direct Meta as the browser dispatch owner. Do not also dispatch the same Pixel event directly if GTM does it. The helper does not create containers or load/init a base Pixel. Require actual IDs before enabling them.
5. Use the actual consent decision before loading/calling analytics or buffering for later replay. Deny-by-default is not a CMP. If the user explicitly directs a scoped no-choice implementation, record that instruction; do not describe it as visitor consent or apply it to other tasks. Optional Windows detection is a browser-reported eligibility hint, not OS authentication.
6. Dispatch only at the contracted point. For an explicitly requested A-originated B-load proxy, require the intended A handoff as well as eligibility; consume the marker and deduplicate so direct B and reloads do not count. A browser marker/referrer is untrusted and can be absent or spoofed; it is attribution, not proof or a security boundary. Never dispatch the same event on both swipe and B. Track B views independently. Tracking errors cannot prevent navigation.
7. Test duplicate/reentrant calls, wrong trigger, denied/revoked consent, SDK failure, eligibility and payload. Local dispatch is not platform receipt.
Read [references/measurement.md](references/measurement.md) for GTM wiring, Meta event IDs, debugging and limits. Run `node --test assets/tests/tracking.test.mjs`. CAPI/postbacks need separately supplied credentials and a real server integration.
