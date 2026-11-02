// Interaction only: never a CAPTCHA or a proof-of-humanity signal.
export function mountSwipe(root, { onSuccess = () => {}, onCancel = () => {}, threshold = 0.9 } = {}) {
  const range = root.querySelector('[data-swipe-range]');
  const button = root.querySelector('[data-swipe-continue]');
  const cancel = root.querySelector('[data-swipe-cancel]');
  const status = root.querySelector('[data-swipe-status]');
  if (!range || !button || !status || threshold <= 0 || threshold > 1) throw new TypeError('Swipe markup/config missing');
  let done = false;
  let keyboard = false;
  const controller = new AbortController();
  const options = { signal: controller.signal };
  function reset() { done = false; keyboard = false; range.value = '0'; range.disabled = false; button.disabled = false; status.textContent = ''; }
  function complete(event, source) {
    if (done || !event.isTrusted) return;
    done = true; range.disabled = true; button.disabled = true;
    status.textContent = 'Interaction completed';
    onSuccess({ event, source });
  }
  range.addEventListener('input', () => { status.textContent = `${range.value}%`; }, options);
  range.addEventListener('keydown', () => { keyboard = true; }, options);
  range.addEventListener('pointerdown', () => { keyboard = false; }, options);
  range.addEventListener('change', event => {
    if (Number(range.value) >= threshold * 100) complete(event, 'swipe');
    else if (!keyboard) { range.value = '0'; status.textContent = 'Slide fully or use Continue'; }
  }, options);
  button.addEventListener('click', event => complete(event, 'button'), options);
  cancel?.addEventListener('click', event => { reset(); onCancel({ event }); }, options);
  return { reset, destroy: () => controller.abort() };
}
