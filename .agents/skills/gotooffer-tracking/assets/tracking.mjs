// Dispatch acceptance is not remote receipt, offer viewing, or conversion.
export function createTracker({ eventName = 'Go2Offer', trigger = 'offer_navigation_requested',
  transport = 'none', pixelId, dataLayerName = 'dataLayer', target = globalThis,
  hasConsent = () => false, eligible = () => true, ledger = new Set(), onError = () => {},
} = {}) {
  if (!/^[A-Za-z][A-Za-z0-9_]{0,63}$/.test(eventName)) throw new TypeError('Invalid event name');
  if (!trigger) throw new TypeError('Choose one trigger');
  if (!['none', 'gtm', 'meta'].includes(transport)) throw new TypeError('Choose one dispatch owner');
  if (transport === 'meta' && !/^\d+$/.test(String(pixelId || ''))) throw new TypeError('Meta Pixel ID required');
  function dispatch({ at, eventId, parameters = {} }) {
    if (at !== trigger) return { status: 'wrong-trigger' };
    if (!eventId || typeof eventId !== 'string') throw new TypeError('Stable eventId required');
    try {
      if (hasConsent() !== true) return { status: 'not-consented' };
      if (eligible() !== true) return { status: 'ineligible' };
    } catch { return { status: 'gate-failed' }; }
    const key = `${eventName}:${eventId}`;
    if (ledger.has(key)) return { status: 'duplicate', eventId };
    if (transport === 'none') return { status: 'disabled' };
    const payload = { ...parameters };
    // Mark before dispatch: protects against re-entrant callbacks and double clicks.
    ledger.add(key);
    try {
      if (transport === 'gtm') {
        target[dataLayerName] ??= [];
        target[dataLayerName].push({ ...payload, event: eventName, event_id: eventId });
      } else {
        if (typeof target.fbq !== 'function') throw new Error('Meta base Pixel not initialized');
        target.fbq('trackSingleCustom', String(pixelId), eventName, payload, { eventID: eventId });
      }
      return { status: 'dispatched', eventId, receiptConfirmed: false };
    } catch (error) {
      ledger.delete(key); // No local dispatch completed; caller may retry the same ID.
      try { onError(error); } catch { /* Tracking never prevents navigation. */ }
      return { status: 'dispatch-failed', eventId };
    }
  }
  return { dispatch, eventName, trigger };
}
export function windowsDesktop(nav = navigator) {
  if (nav.userAgentData) return nav.userAgentData.platform === 'Windows' && nav.userAgentData.mobile !== true;
  return /Windows NT/i.test(nav.userAgent || '') && /^Win/i.test(nav.platform || '') &&
    !/Windows Phone|Android|iPhone|iPad|Mobile/i.test(nav.userAgent || '');
}
