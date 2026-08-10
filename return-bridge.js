document.addEventListener('click', event => {
  const button = event.target.closest('#travelingFastBtn');
  if (!button) return;

  let state = null;
  try {
    state = JSON.parse(localStorage.getItem('pixo:travel-state') || 'null');
  } catch (_) {}

  if (!state?.finished) return;

  event.preventDefault();
  event.stopPropagation();
  event.stopImmediatePropagation();
  location.href = './return.html';
}, true);
