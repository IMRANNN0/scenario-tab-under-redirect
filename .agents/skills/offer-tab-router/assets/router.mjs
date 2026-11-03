export function validateDestinations({ offerUrl, bUrl = null, base = location.href, allowHttp = false, allowedBUrls = [] }) {
  const offer = new URL(offerUrl, base);
  const protocols = allowHttp ? ['https:', 'http:'] : ['https:'];
  if (!offerUrl || !protocols.includes(offer.protocol) || offer.username || offer.password) throw new TypeError('Invalid offer URL');
  const b = bUrl ? new URL(bUrl, base) : null;
  if (b && (!protocols.includes(b.protocol) || (b.origin !== new URL(base).origin && !allowedBUrls.includes(b.href)) || b.username || b.password)) throw new TypeError('B must be same-origin or an explicitly approved exact URL');
  return { offer: offer.href, b: b?.href ?? null };
}
export function createOfferRouter({ offerUrl, bUrl = null, mode = 'new-tab', originalTab = 'replace-with-b', win = window,
  allowHttp = false, allowedBUrls = [], onRequested = () => {}, onResult = () => {},
} = {}) {
  if (!['new-tab', 'same-tab'].includes(mode)) throw new TypeError('Invalid navigation mode');
  if (!['replace-with-b', 'keep-a'].includes(originalTab)) throw new TypeError('Invalid original tab behavior');
  if (mode === 'new-tab' && originalTab === 'replace-with-b' && !bUrl) throw new TypeError('B URL required for the A-to-B scenario');
  if (originalTab === 'keep-a' && bUrl) throw new TypeError('Do not supply B when keeping A');
  const urls = validateDestinations({ offerUrl, bUrl, base: win.location.href, allowHttp, allowedBUrls });
  const committed = new Set();
  const notify = (fn, value) => { try { fn(value); } catch { /* Telemetry cannot stop navigation. */ } };
  function route(event, { eventId, bFragment = '' }) {
    // Check the real final activation. Never open from a delayed verification callback.
    if (!event?.isTrusted || event.defaultPrevented || (event.button !== undefined && event.button !== 0) ||
      event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return { status: 'not-handled' };
    if (!eventId) throw new TypeError('eventId required');
    if (committed.has(eventId)) { event.preventDefault(); return { status: 'duplicate' }; }
    let tab = null;
    if (mode === 'new-tab') {
      try {
        // Retain handle to detect blockers, then sever opener BEFORE external navigation.
        tab = win.open('about:blank', '_blank');
        if (tab) { tab.opener = null; tab.location.replace(urls.offer); }
      } catch {
        try { tab?.close(); } catch { /* Browser owns the tab. */ }
        tab = null;
      }
    }
    event.preventDefault();
    committed.add(eventId);
    const outcome = tab ? 'new-tab-requested' : 'same-tab-requested';
    notify(onRequested, { eventId, outcome, offerUrl: urls.offer });
    const result = { status: outcome, bRequested: false, offerViewed: 'unknown' };
    try {
      if (tab) {
        if (originalTab === 'replace-with-b' && urls.b) {
          const bDestination = new URL(urls.b); bDestination.hash = bFragment;
          win.location.replace(bDestination.href); result.bRequested = true;
        }
      } else win.location.assign(urls.offer); // Standard same-tab fallback. Never loads B here.
    } catch {
      if (!tab) committed.delete(eventId);
      result.status = tab ? 'b-navigation-failed' : 'navigation-failed';
    }
    notify(onResult, result);
    return result;
  }
  return { route, urls };
}
