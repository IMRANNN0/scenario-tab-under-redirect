// Optional base loaders. Importing this module sends nothing.
// Prefer the target's existing CMP/tag loader when one already owns initialization.
const initializedPixels = new WeakMap();
const initializedContainers = new WeakMap();
export function loadMetaPixel({pixelId, hasConsent = () => false, win = window, doc = document} = {}) {
  if (hasConsent() !== true) return {status:'not-consented'};
  if (!/^\d+$/.test(String(pixelId || ''))) throw new TypeError('Pixel ID required');
  const id = String(pixelId);
  let ids = initializedPixels.get(win);
  if (!ids) { ids = new Set(); initializedPixels.set(win, ids); }
  if (ids.has(id)) return {status:'already-initialized'};
  if (!win.fbq) {
    const fbq = function (...args) {
      if (fbq.callMethod) fbq.callMethod(...args);
      else fbq.queue.push(args);
    };
    fbq.queue = []; fbq.loaded = true; fbq.version = '2.0'; fbq.push = fbq;
    win.fbq = fbq; win._fbq ??= fbq;
    const script = doc.createElement('script');
    script.async = true; script.src = 'https://connect.facebook.net/en_US/fbevents.js';
    doc.head.append(script);
  }
  win.fbq('init', id); // No automatic PageView or Go2Offer.
  ids.add(id);
  return {status:'initialization-requested', receiptConfirmed:false};
}
export function loadGtm({containerId, dataLayerName = 'dataLayer', hasConsent = () => false,
  win = window, doc = document} = {}) {
  if (hasConsent() !== true) return {status:'not-consented'};
  if (!/^GTM-[A-Z0-9]+$/.test(containerId || '') || !/^[A-Za-z_$][A-Za-z0-9_$]*$/.test(dataLayerName)) throw new TypeError('GTM configuration required');
  let ids = initializedContainers.get(win);
  if (!ids) { ids = new Set(); initializedContainers.set(win, ids); }
  const key = `${containerId}:${dataLayerName}`;
  if (ids.has(key)) return {status:'already-initialized'};
  win[dataLayerName] ??= [];
  win[dataLayerName].push({'gtm.start':Date.now(), event:'gtm.js'});
  const script = doc.createElement('script'); script.async = true;
  const query = new URLSearchParams({id:containerId});
  if (dataLayerName !== 'dataLayer') query.set('l', dataLayerName);
  script.src = `https://www.googletagmanager.com/gtm.js?${query}`;
  doc.head.append(script); ids.add(key);
  return {status:'initialization-requested', receiptConfirmed:false};
}
