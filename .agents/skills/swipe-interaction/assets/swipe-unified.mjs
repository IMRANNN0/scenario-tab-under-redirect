// Direct interaction only; never a verification result or a security boundary.
export function mountUnifiedSwipe(button, { onSuccess = () => {}, threshold = .9 } = {}) {
  if (!button || button.tagName !== 'BUTTON' || threshold <= 0 || threshold > 1) throw new TypeError('Unified swipe requires a native button and threshold');
  const controller = new AbortController();
  const options = { signal: controller.signal };
  let done = false, pointer, startX = 0, startY = 0, distance = 0, travel = 0, moved = false, vertical = false, suppressClick = false;
  function paint(value) {
    distance = Math.max(0, Math.min(travel, value));
    button.style.setProperty('--swipe-offset', `${distance}px`);
    button.style.setProperty('--swipe-progress', travel ? distance / travel : 0);
  }
  function releasePointer() {
    const id = pointer; pointer = undefined;
    if (id !== undefined && button.hasPointerCapture(id)) button.releasePointerCapture(id);
    button.removeAttribute('data-dragging');
  }
  function reset() { releasePointer(); done = false; moved = false; vertical = false; suppressClick = false; button.disabled = false; paint(0); }
  function complete(event, source) {
    if (done || !event.isTrusted) return;
    done = true; button.disabled = true;
    onSuccess({ event, source });
  }
  button.addEventListener('pointerdown', event => {
    if (done || !event.isPrimary || event.button !== 0) return;
    suppressClick = false; moved = false; vertical = false;
    pointer = event.pointerId; startX = event.clientX; startY = event.clientY;
    const thumb = button.querySelector('.swipe-action__thumb');
    travel = Math.max(1, button.clientWidth - (thumb?.offsetWidth || 54) - 12);
    button.setPointerCapture(pointer);
    button.setAttribute('data-dragging', '');
  }, options);
  button.addEventListener('pointermove', event => {
    if (event.pointerId !== pointer || done) return;
    const dx = event.clientX - startX, dy = event.clientY - startY;
    if (Math.abs(dx) > 8 || Math.abs(dy) > 8) moved = true;
    if (Math.abs(dy) > Math.abs(dx) && Math.abs(dy) > 12) vertical = true;
    paint(vertical ? 0 : dx);
  }, options);
  button.addEventListener('pointerup', event => {
    if (event.pointerId !== pointer || done) return;
    const success = moved && !vertical && distance >= travel * threshold;
    suppressClick = moved;
    releasePointer();
    if (success) complete(event, 'swipe'); else paint(0);
  }, options);
  const cancel = () => { if (pointer !== undefined) { suppressClick = true; releasePointer(); paint(0); } };
  button.addEventListener('pointercancel', cancel, options);
  button.addEventListener('lostpointercapture', cancel, options);
  button.addEventListener('click', event => {
    if (suppressClick && event.detail !== 0) { suppressClick = false; event.preventDefault(); return; }
    complete(event, event.detail === 0 ? 'keyboard' : 'tap');
  }, options);
  return { reset, destroy: () => { releasePointer(); controller.abort(); } };
}
