/**
 * Creative Wing Investments — Accessible Modal Dialog System
 */
let activeModalTrigger = null;

function ensureModalContainer() {
  let backdrop = document.getElementById('cwi-modal-backdrop');
  if (backdrop) return backdrop;

  backdrop = document.createElement('div');
  backdrop.id = 'cwi-modal-backdrop';
  backdrop.className = 'modal-backdrop';
  backdrop.setAttribute('role', 'dialog');
  backdrop.setAttribute('aria-modal', 'true');
  backdrop.setAttribute('aria-hidden', 'true');

  const closeIcon = typeof getIcon === 'function' ? getIcon('close') : '&times;';

  backdrop.innerHTML = [
    '<div class="modal-dialog">',
    '  <button class="modal-close-btn" id="cwi-modal-close" aria-label="Close dialog">',
    '    ' + closeIcon,
    '  </button>',
    '  <div class="modal-media" id="cwi-modal-media"></div>',
    '  <div class="modal-content" id="cwi-modal-content"></div>',
    '</div>'
  ].join('\n');

  document.body.appendChild(backdrop);

  // Close handlers
  backdrop.addEventListener('click', (e) => {
    if (e.target === backdrop || e.target.closest('#cwi-modal-close')) {
      closeModal();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && backdrop.classList.contains('open')) {
      closeModal();
    }
  });

  return backdrop;
}

function openVehicleModal(id, triggerEl) {
  activeModalTrigger = triggerEl || document.activeElement;
  const item = CARS.find(c => c.id === id);
  if (!item) return;

  const backdrop = ensureModalContainer();
  const mediaEl = document.getElementById('cwi-modal-media');
  const contentEl = document.getElementById('cwi-modal-content');

  const idTag = item.id.startsWith('CW-') ? item.id : ('CW-' + item.id);
  const normStatus = (item.status || (item.inStock !== false ? 'Available' : 'Sold')).toLowerCase();
  let stockClass = 'in-stock';
  let stockText = 'In Stock · Harare';
  if (normStatus === 'reserved') {
    stockClass = 'reserved';
    stockText = 'Reserved · Deposit Held';
  } else if (normStatus === 'sold' || normStatus === 'out-stock') {
    stockClass = 'sold';
    stockText = 'Sold · Harare';
  }
  const priceDisplay = item.price ? Number(item.price).toLocaleString('en-US') : 'On request';
  const waUrl = buildVehicleWhatsAppUrl(item);

  if (item.gallery && item.gallery.length > 1) {
    const thumbs = item.gallery.map((gImg, idx) => 
      '<button type="button" class="modal-gallery-thumb' + (idx === 0 ? ' active' : '') + '" onclick="document.getElementById(\'cwi-modal-main-img\').src=\'' + gImg + '\';this.parentElement.querySelectorAll(\'.modal-gallery-thumb\').forEach(t=>t.classList.remove(\'active\'));this.classList.add(\'active\');" aria-label="View photo ' + (idx + 1) + '">' +
      '<img src="' + gImg + '" alt="' + item.name + ' photo ' + (idx + 1) + '">' +
      '</button>'
    ).join('');
    mediaEl.innerHTML = [
      '<div class="modal-gallery-wrap">',
      '  <div class="modal-gallery-main">',
      '    <img id="cwi-modal-main-img" src="' + item.image + '" alt="' + item.name + '">',
      '  </div>',
      '  <div class="modal-gallery-thumbs" aria-label="Photo gallery">' + thumbs + '</div>',
      '</div>'
    ].join('\n');
  } else {
    mediaEl.innerHTML = '<img id="cwi-modal-main-img" src="' + item.image + '" alt="' + item.name + '" onerror="this.src=\'images/logo.jpeg\'">';
  }

  contentEl.innerHTML = [
    '<div class="modal-header">',
    '  <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px">',
    '    <span class="stock-badge ' + stockClass + '">' + stockText + '</span>',
    '    <span class="card-id-tag">' + idTag + '</span>',
    '  </div>',
    '  <h2 class="modal-title">' + item.name + '</h2>',
    '</div>',
    '<div class="modal-price-box">',
    '  <div class="modal-price-val"><b>USD</b> ' + priceDisplay + '</div>',
    '  <span style="font-size:0.8rem;color:var(--text-dim)">Cash on collection</span>',
    '</div>',
    '<div class="modal-specs-grid">',
    '  <div class="modal-spec-item"><span class="modal-spec-label">Year</span><span class="modal-spec-value">' + (item.year || 'N/A') + '</span></div>',
    '  <div class="modal-spec-item"><span class="modal-spec-label">Body Style</span><span class="modal-spec-value">' + (item.body || 'N/A') + '</span></div>',
    '  <div class="modal-spec-item"><span class="modal-spec-label">Transmission</span><span class="modal-spec-value">' + (item.transmission || 'N/A') + '</span></div>',
    '  <div class="modal-spec-item"><span class="modal-spec-label">Fuel Type</span><span class="modal-spec-value">' + (item.fuel || 'N/A') + '</span></div>',
    '  <div class="modal-spec-item"><span class="modal-spec-label">Mileage</span><span class="modal-spec-value">' + (item.mileage || 'N/A') + '</span></div>',
    '  <div class="modal-spec-item"><span class="modal-spec-label">Exterior Color</span><span class="modal-spec-value">' + (item.color || 'N/A') + '</span></div>',
    '</div>',
    '<p class="modal-notice">Inspected and ready for viewing in Harare. Physical inspection welcomed. Cash deals only in USD.</p>',
    '<div class="modal-actions">',
    '  <a href="' + waUrl + '" target="_blank" rel="noopener" class="btn btn-wa">Order on WhatsApp</a>',
    '  <button type="button" class="btn btn-ghost" onclick="closeModal()">Close</button>',
    '</div>'
  ].join('\n');

  backdrop.classList.add('open');
  backdrop.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
  const closeBtn = document.getElementById('cwi-modal-close');
  if (closeBtn) closeBtn.focus();
}

function openSportswearModal(id, triggerEl) {
  activeModalTrigger = triggerEl || document.activeElement;
  const item = SPORTSWEAR.find(s => s.id === id);
  if (!item) return;

  const backdrop = ensureModalContainer();
  const mediaEl = document.getElementById('cwi-modal-media');
  const contentEl = document.getElementById('cwi-modal-content');

  const idTag = item.id.startsWith('CW-') ? item.id : ('CW-' + item.id);
  const normStatus = (item.status || (item.inStock !== false ? 'Available' : 'Sold')).toLowerCase();
  let stockClass = 'in-stock';
  let stockText = 'In Stock · Harare';
  if (normStatus === 'reserved') {
    stockClass = 'reserved';
    stockText = 'Reserved · Deposit Held';
  } else if (normStatus === 'sold' || normStatus === 'out-stock') {
    stockClass = 'sold';
    stockText = 'Sold · Harare';
  }
  const priceDisplay = item.price ? Number(item.price).toLocaleString('en-US') : 'On request';
  const waUrl = buildSportswearWhatsAppUrl(item);

  mediaEl.innerHTML = '<img src="' + item.image + '" alt="' + item.name + '" onerror="this.src=\'images/logo.jpeg\'">';

  contentEl.innerHTML = [
    '<div class="modal-header">',
    '  <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px">',
    '    <span class="stock-badge ' + stockClass + '">' + stockText + '</span>',
    '    <span class="card-id-tag">' + idTag + '</span>',
    '  </div>',
    '  <h2 class="modal-title">' + item.name + '</h2>',
    '</div>',
    '<div class="modal-price-box">',
    '  <div class="modal-price-val"><b>USD</b> ' + priceDisplay + '</div>',
    '  <span style="font-size:0.8rem;color:var(--text-dim)">Set includes Jersey + Shorts</span>',
    '</div>',
    '<div class="modal-specs-grid">',
    '  <div class="modal-spec-item" style="grid-column: span 2"><span class="modal-spec-label">Supported Sizing</span><span class="modal-spec-value">S • M • L • XL • XXL</span></div>',
    '  <div class="modal-spec-item"><span class="modal-spec-label">Material</span><span class="modal-spec-value">Breathable Match Polyester</span></div>',
    '  <div class="modal-spec-item"><span class="modal-spec-label">Customization</span><span class="modal-spec-value">Team name & number printing on request</span></div>',
    '</div>',
    '<p class="modal-notice">Durable, breathable team kit for competitive football, club leagues, and training. Cash on collection in Harare.</p>',
    '<div class="modal-actions">',
    '  <a href="' + waUrl + '" target="_blank" rel="noopener" class="btn btn-wa">Order on WhatsApp</a>',
    '  <button type="button" class="btn btn-ghost" onclick="closeModal()">Close</button>',
    '</div>'
  ].join('\n');

  backdrop.classList.add('open');
  backdrop.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
  const closeBtn = document.getElementById('cwi-modal-close');
  if (closeBtn) closeBtn.focus();
}

function closeModal() {
  const backdrop = document.getElementById('cwi-modal-backdrop');
  if (!backdrop) return;

  backdrop.classList.remove('open');
  backdrop.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';

  if (activeModalTrigger && typeof activeModalTrigger.focus === 'function') {
    activeModalTrigger.focus();
    activeModalTrigger = null;
  }
}
