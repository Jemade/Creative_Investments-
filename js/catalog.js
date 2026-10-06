/**
 * Creative Wing Investments — Catalog & Filtering Engine
 */

function getStatusBadgeHtml(status, inStock) {
  const normStatus = (status || (inStock !== false ? 'Available' : 'Sold')).toLowerCase();
  if (normStatus === 'reserved') {
    return '<span class="stock-badge reserved"><span class="badge-pulse-dot"></span> Reserved · Deposit Held</span>';
  } else if (normStatus === 'sold' || normStatus === 'out-stock') {
    return '<span class="stock-badge sold"><span class="badge-pulse-dot"></span> Sold · Harare</span>';
  }
  return '<span class="stock-badge in-stock"><span class="badge-pulse-dot"></span> In Stock · Harare</span>';
}

function renderVehicleCard(vehicle) {
  const idTag = vehicle.id.startsWith('CW-') ? vehicle.id : ('CW-' + vehicle.id);
  const priceDisplay = vehicle.price ? Number(vehicle.price).toLocaleString('en-US') : 'On request';
  const waUrl = buildVehicleWhatsAppUrl(vehicle);
  const isFlagship = vehicle.id === 'C00';
  const photoCount = vehicle.gallery ? vehicle.gallery.length : 1;
  const statusBadge = getStatusBadgeHtml(vehicle.status, vehicle.inStock);

  return [
    '<article class="card vehicle-card' + (isFlagship ? ' flagship-card' : '') + '" data-id="' + vehicle.id + '" data-category="' + (vehicle.body || '') + '">',
    '  <div class="card-media">',
    '    <div class="card-badges">',
    '      ' + statusBadge,
    '      <span class="card-type-tag">' + (vehicle.year || '') + ' · ' + (vehicle.body || '').toUpperCase() + '</span>',
    '    </div>',
    '    <img loading="lazy" src="' + vehicle.image + '" alt="' + vehicle.name + '" onerror="this.src=\'images/logo.jpeg\'">',
    (photoCount > 1 ? '    <span class="photo-count-badge"><svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg> ' + photoCount + ' Photos</span>' : ''),
    '  </div>',
    '  <div class="card-body">',
    '    <div class="card-eyebrow-row">',
    '      <span class="card-id-mono">' + idTag + '</span>',
    '      <span class="card-location-tag">Harare Viewing</span>',
    '    </div>',
    '    <h3 class="card-title">' + vehicle.name + '</h3>',
    '    <div class="vehicle-specs-grid">',
    '      <div class="spec-pill"><span class="spec-lbl">Mileage</span><span class="spec-val">' + (vehicle.mileage || 'Verified') + '</span></div>',
    '      <div class="spec-pill"><span class="spec-lbl">Gearbox</span><span class="spec-val">' + (vehicle.transmission || 'Automatic') + '</span></div>',
    '      <div class="spec-pill"><span class="spec-lbl">Fuel</span><span class="spec-val">' + (vehicle.fuel || 'Diesel') + '</span></div>',
    '      <div class="spec-pill"><span class="spec-lbl">Color</span><span class="spec-val">' + (vehicle.color || 'Standard') + '</span></div>',
    '    </div>',
    '    <div class="card-price-row">',
    '      <div>',
    '        <span class="price-label">Cash Price (USD)</span>',
    '        <div class="price-val"><b>$</b>' + priceDisplay + '</div>',
    '      </div>',
    '      <span class="payment-badge">USD Cash Only</span>',
    '    </div>',
    '    <div class="card-actions">',
    '      <button type="button" class="btn btn-ghost btn-sm" onclick="openVehicleModal(\'' + vehicle.id + '\', this)" aria-label="View specifications for ' + vehicle.name + '">',
    '        <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>',
    '        <span>Specs &amp; Photos</span>',
    '      </button>',
    '      <a href="' + waUrl + '" target="_blank" rel="noopener" class="btn btn-wa btn-sm" aria-label="Inquire about ' + vehicle.name + ' on WhatsApp">',
    '        <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor"><path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2m.01 1.67c2.2 0 4.26.86 5.82 2.41a8.204 8.204 0 0 1 2.41 5.83c0 4.54-3.7 8.24-8.24 8.24-1.48 0-2.93-.39-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.19 8.19 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.24-8.24m4.52 11.66c-.25-.13-1.47-.72-1.7-.81-.23-.08-.39-.13-.56.13-.17.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.13-1.06-.39-2.03-1.25-.75-.67-1.26-1.5-1.41-1.75-.14-.25-.02-.39.11-.51.11-.11.25-.29.37-.43s.17-.25.25-.42c.08-.17.04-.31-.02-.44-.06-.13-.56-1.35-.77-1.85-.2-.49-.41-.42-.56-.43h-.48c-.17 0-.44.06-.67.31-.23.25-.88.86-.88 2.1 0 1.24.9 2.44 1.03 2.61.13.17 1.77 2.71 4.3 3.8.6.26 1.07.41 1.44.53.61.19 1.16.17 1.6.1.49-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.15-1.18-.07-.12-.23-.19-.48-.32"/></svg>',
    '        <span>Inquire</span>',
    '      </a>',
    '    </div>',
    '  </div>',
    '</article>'
  ].join('\n');
}

function renderSportswearCard(item) {
  const idTag = item.id.startsWith('CW-') ? item.id : ('CW-' + item.id);
  const priceDisplay = item.price ? Number(item.price).toLocaleString('en-US') : 'On request';
  const waUrl = buildSportswearWhatsAppUrl(item);
  const statusBadge = getStatusBadgeHtml(item.status, item.inStock);

  return [
    '<article class="card apparel-card" data-id="' + item.id + '" data-category="' + (item.category || '') + '">',
    '  <div class="card-media square-media">',
    '    <div class="card-badges">',
    '      ' + statusBadge,
    '      <span class="card-type-tag">' + (item.category || 'MATCH SET').toUpperCase() + '</span>',
    '    </div>',
    '    <img loading="lazy" src="' + item.image + '" alt="' + item.name + '" onerror="this.src=\'images/logo.jpeg\'">',
    '  </div>',
    '  <div class="card-body">',
    '    <div class="card-eyebrow-row">',
    '      <span class="card-id-mono">' + idTag + '</span>',
    '      <span class="card-kit-tag">Jersey + Shorts Included</span>',
    '    </div>',
    '    <h3 class="card-title">' + item.name + '</h3>',
    '    <div class="apparel-size-row">',
    '      <span class="size-guide-label">Sizes Available:</span>',
    '      <div class="size-pills">',
    '        <span class="size-pill">S</span>',
    '        <span class="size-pill">M</span>',
    '        <span class="size-pill">L</span>',
    '        <span class="size-pill">XL</span>',
    '        <span class="size-pill">XXL</span>',
    '      </div>',
    '    </div>',
    '    <div class="card-price-row">',
    '      <div>',
    '        <span class="price-label">Squad Set Price</span>',
    '        <div class="price-val"><b>$</b>' + priceDisplay + ' <small style="font-size:0.75rem;font-weight:500;color:var(--muted)">/ set</small></div>',
    '      </div>',
    '      <span class="payment-badge">Custom Printing OK</span>',
    '    </div>',
    '    <div class="card-actions">',
    '      <button type="button" class="btn btn-ghost btn-sm" onclick="openSportswearModal(\'' + item.id + '\', this)" aria-label="View kit details for ' + item.name + '">',
    '        <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>',
    '        <span>Kit Details</span>',
    '      </button>',
    '      <a href="' + waUrl + '" target="_blank" rel="noopener" class="btn btn-wa btn-sm" aria-label="Order ' + item.name + ' on WhatsApp">',
    '        <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor"><path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2m.01 1.67c2.2 0 4.26.86 5.82 2.41a8.204 8.204 0 0 1 2.41 5.83c0 4.54-3.7 8.24-8.24 8.24-1.48 0-2.93-.39-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.19 8.19 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.24-8.24m4.52 11.66c-.25-.13-1.47-.72-1.7-.81-.23-.08-.39-.13-.56.13-.17.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.13-1.06-.39-2.03-1.25-.75-.67-1.26-1.5-1.41-1.75-.14-.25-.02-.39.11-.51.11-.11.25-.29.37-.43s.17-.25.25-.42c.08-.17.04-.31-.02-.44-.06-.13-.56-1.35-.77-1.85-.2-.49-.41-.42-.56-.43h-.48c-.17 0-.44.06-.67.31-.23.25-.88.86-.88 2.1 0 1.24.9 2.44 1.03 2.61.13.17 1.77 2.71 4.3 3.8.6.26 1.07.41 1.44.53.61.19 1.16.17 1.6.1.49-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.15-1.18-.07-.12-.23-.19-.48-.32"/></svg>',
    '        <span>Order Kit</span>',
    '      </a>',
    '    </div>',
    '  </div>',
    '</article>'
  ].join('\n');
}

/**
 * Dedicated Homepage Vehicle Card Renderer
 * CRITICAL DIRECTIVE: ABSOLUTELY NO PRICES DISPLAYED ON HOMEPAGE.
 * Prices strictly belong on dedicated cars.html and modal specifications.
 */
function renderHomeVehicleCard(vehicle) {
  const idTag = vehicle.id.startsWith('CW-') ? vehicle.id : ('CW-' + vehicle.id);
  const waUrl = typeof buildHomeVehicleWhatsAppUrl === 'function' ? buildHomeVehicleWhatsAppUrl(vehicle) : buildVehicleWhatsAppUrl(vehicle);
  const isFlagship = vehicle.id === 'C00';
  const photoCount = vehicle.gallery ? vehicle.gallery.length : 1;
  const statusBadge = getStatusBadgeHtml(vehicle.status, vehicle.inStock);

  return [
    '<article class="card vehicle-card' + (isFlagship ? ' flagship-card' : '') + '" data-id="' + vehicle.id + '" data-category="' + (vehicle.body || '') + '">',
    '  <div class="card-media">',
    '    <div class="card-badges">',
    '      ' + statusBadge,
    '      <span class="card-type-tag">' + (vehicle.year || '') + ' · ' + (vehicle.body || '').toUpperCase() + '</span>',
    '    </div>',
    '    <img loading="lazy" src="' + vehicle.image + '" alt="' + vehicle.name + '" onerror="this.src=\'images/logo.jpeg\'">',
    (photoCount > 1 ? '    <span class="photo-count-badge"><svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg> ' + photoCount + ' Photos</span>' : ''),
    '  </div>',
    '  <div class="card-body">',
    '    <div class="card-eyebrow-row">',
    '      <span class="card-id-mono">' + idTag + '</span>',
    '      <span class="card-location-tag">Harare Viewing</span>',
    '    </div>',
    '    <h3 class="card-title">' + vehicle.name + '</h3>',
    '    <div class="vehicle-specs-grid">',
    '      <div class="spec-pill"><span class="spec-lbl">Mileage</span><span class="spec-val">' + (vehicle.mileage || 'Verified') + '</span></div>',
    '      <div class="spec-pill"><span class="spec-lbl">Gearbox</span><span class="spec-val">' + (vehicle.transmission || 'Automatic') + '</span></div>',
    '      <div class="spec-pill"><span class="spec-lbl">Fuel</span><span class="spec-val">' + (vehicle.fuel || 'Diesel') + '</span></div>',
    '      <div class="spec-pill"><span class="spec-lbl">Color</span><span class="spec-val">' + (vehicle.color || 'Standard') + '</span></div>',
    '    </div>',
    '    <div class="card-actions" style="margin-top:auto;padding-top:14px">',
    '      <button type="button" class="btn btn-ghost btn-sm" onclick="openVehicleModal(\'' + vehicle.id + '\', this)" aria-label="View specifications for ' + vehicle.name + '">',
    '        <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>',
    '        <span>Specs &amp; Photos</span>',
    '      </button>',
    '      <a href="' + waUrl + '" target="_blank" rel="noopener" class="btn btn-wa btn-sm" aria-label="Inquire about ' + vehicle.name + ' on WhatsApp">',
    '        <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor"><path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2m.01 1.67c2.2 0 4.26.86 5.82 2.41a8.204 8.204 0 0 1 2.41 5.83c0 4.54-3.7 8.24-8.24 8.24-1.48 0-2.93-.39-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.19 8.19 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.24-8.24m4.52 11.66c-.25-.13-1.47-.72-1.7-.81-.23-.08-.39-.13-.56.13-.17.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.13-1.06-.39-2.03-1.25-.75-.67-1.26-1.5-1.41-1.75-.14-.25-.02-.39.11-.51.11-.11.25-.29.37-.43s.17-.25.25-.42c.08-.17.04-.31-.02-.44-.06-.13-.56-1.35-.77-1.85-.2-.49-.41-.42-.56-.43h-.48c-.17 0-.44.06-.67.31-.23.25-.88.86-.88 2.1 0 1.24.9 2.44 1.03 2.61.13.17 1.77 2.71 4.3 3.8.6.26 1.07.41 1.44.53.61.19 1.16.17 1.6.1.49-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.15-1.18-.07-.12-.23-.19-.48-.32"/></svg>',
    '        <span>Inquire</span>',
    '      </a>',
    '    </div>',
    '  </div>',
    '</article>'
  ].join('\n');
}

/**
 * Dedicated Homepage Sportswear Card Renderer
 * CRITICAL DIRECTIVE: ABSOLUTELY NO PRICES DISPLAYED ON HOMEPAGE.
 * Squad pricing strictly belongs on dedicated sportswear.html and kit modals.
 */
function renderHomeSportswearCard(item) {
  const idTag = item.id.startsWith('CW-') ? item.id : ('CW-' + item.id);
  const waUrl = buildSportswearWhatsAppUrl(item);
  const statusBadge = getStatusBadgeHtml(item.status, item.inStock);

  return [
    '<article class="card apparel-card" data-id="' + item.id + '" data-category="' + (item.category || '') + '">',
    '  <div class="card-media square-media">',
    '    <div class="card-badges">',
    '      ' + statusBadge,
    '      <span class="card-type-tag">' + (item.category || 'MATCH SET').toUpperCase() + '</span>',
    '    </div>',
    '    <img loading="lazy" src="' + item.image + '" alt="' + item.name + '" onerror="this.src=\'images/logo.jpeg\'">',
    '  </div>',
    '  <div class="card-body">',
    '    <div class="card-eyebrow-row">',
    '      <span class="card-id-mono">' + idTag + '</span>',
    '      <span class="card-kit-tag">Jersey + Shorts Included</span>',
    '    </div>',
    '    <h3 class="card-title">' + item.name + '</h3>',
    '    <div class="apparel-size-row">',
    '      <span class="size-guide-label">Sizes Available:</span>',
    '      <div class="size-pills">',
    '        <span class="size-pill">S</span>',
    '        <span class="size-pill">M</span>',
    '        <span class="size-pill">L</span>',
    '        <span class="size-pill">XL</span>',
    '        <span class="size-pill">XXL</span>',
    '      </div>',
    '    </div>',
    '    <div class="card-actions" style="margin-top:auto;padding-top:14px">',
    '      <button type="button" class="btn btn-ghost btn-sm" onclick="openSportswearModal(\'' + item.id + '\', this)" aria-label="View kit details for ' + item.name + '">',
    '        <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>',
    '        <span>Kit Details</span>',
    '      </button>',
    '      <a href="' + waUrl + '" target="_blank" rel="noopener" class="btn btn-wa btn-sm" aria-label="Order ' + item.name + ' on WhatsApp">',
    '        <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor"><path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2m.01 1.67c2.2 0 4.26.86 5.82 2.41a8.204 8.204 0 0 1 2.41 5.83c0 4.54-3.7 8.24-8.24 8.24-1.48 0-2.93-.39-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.19 8.19 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.24-8.24m4.52 11.66c-.25-.13-1.47-.72-1.7-.81-.23-.08-.39-.13-.56.13-.17.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.13-1.06-.39-2.03-1.25-.75-.67-1.26-1.5-1.41-1.75-.14-.25-.02-.39.11-.51.11-.11.25-.29.37-.43s.17-.25.25-.42c.08-.17.04-.31-.02-.44-.06-.13-.56-1.35-.77-1.85-.2-.49-.41-.42-.56-.43h-.48c-.17 0-.44.06-.67.31-.23.25-.88.86-.88 2.1 0 1.24.9 2.44 1.03 2.61.13.17 1.77 2.71 4.3 3.8.6.26 1.07.41 1.44.53.61.19 1.16.17 1.6.1.49-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.15-1.18-.07-.12-.23-.19-.48-.32"/></svg>',
    '        <span>Order Kit</span>',
    '      </a>',
    '    </div>',
    '  </div>',
    '</article>'
  ].join('\n');
}

/**
 * Render a subset of products into a featured grid (e.g. on homepage)
 * STRICT REQUIREMENT: Absolutely NO prices on homepage cards.
 */
function renderFeaturedProducts(gridSelector, items, type, count) {
  const gridEl = document.querySelector(gridSelector);
  if (!gridEl || !items || !items.length) return;
  const slice = (typeof count === 'number' && count > 0) ? items.slice(0, count) : items;
  const renderCard = type === 'cars' ? renderHomeVehicleCard : renderHomeSportswearCard;
  gridEl.innerHTML = slice.map(renderCard).join('');
}

// Global aliases for compatibility
window.renderFeaturedProducts = renderFeaturedProducts;
window.renderHomeVehicleCard = renderHomeVehicleCard;
window.renderHomeSportswearCard = renderHomeSportswearCard;
window.CWI = window.CWI || {};
window.CWI.renderFeatured = renderFeaturedProducts;

/**
 * Setup full catalog system with live search, filters, category chips & sorting
 */
function setupCatalog(opts) {
  const gridSelector = opts.gridSelector;
  const items = opts.items || [];
  const type = opts.type;
  const categories = opts.categories || [];

  const gridEl = document.querySelector(gridSelector);
  if (!gridEl) return;

  const searchInput = document.getElementById('catalogSearch');
  const sortSelect = document.getElementById('catalogSort');
  const stockOnlyCheck = document.getElementById('stockOnly');
  const chipsContainer = document.getElementById('categoryChips');
  const countEl = document.getElementById('catalogCount');

  let activeCategory = 'all';
  let activeQuery = '';
  let inStockOnly = false;
  let activeSort = 'default';

  // Build filter chips
  if (chipsContainer && categories.length) {
    let chipsHtml = '<button type="button" class="chip active" data-cat="all">All</button>';
    categories.forEach(cat => {
      chipsHtml += '<button type="button" class="chip" data-cat="' + cat + '">' + cat + '</button>';
    });
    chipsContainer.innerHTML = chipsHtml;

    chipsContainer.addEventListener('click', (e) => {
      const chip = e.target.closest('.chip');
      if (!chip) return;
      chipsContainer.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      activeCategory = chip.dataset.cat;
      filterAndRender();
    });
  }

  function filterAndRender() {
    let filtered = items.slice();

    // Category filter
    if (activeCategory && activeCategory !== 'all') {
      filtered = filtered.filter(item => {
        if (type === 'cars') return (item.body || '').toLowerCase() === activeCategory.toLowerCase();
        if (type === 'sportswear') return (item.category || '').toLowerCase() === activeCategory.toLowerCase();
        return true;
      });
    }

    // In Stock Only
    if (inStockOnly) {
      filtered = filtered.filter(item => item.inStock === true);
    }

    // Search query
    if (activeQuery) {
      const q = activeQuery.toLowerCase().trim();
      filtered = filtered.filter(item => {
        const idMatch = (item.id || '').toLowerCase().includes(q);
        const nameMatch = (item.name || '').toLowerCase().includes(q);
        const bodyMatch = (item.body || '').toLowerCase().includes(q);
        const fuelMatch = (item.fuel || '').toLowerCase().includes(q);
        const colorMatch = (item.color || '').toLowerCase().includes(q);
        return idMatch || nameMatch || bodyMatch || fuelMatch || colorMatch;
      });
    }

    // Sorting
    if (activeSort === 'price-asc') {
      filtered.sort((a, b) => (a.price || 0) - (b.price || 0));
    } else if (activeSort === 'price-desc') {
      filtered.sort((a, b) => (b.price || 0) - (a.price || 0));
    } else if (activeSort === 'name') {
      filtered.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    } else if (activeSort === 'year-desc') {
      filtered.sort((a, b) => (b.year || 0) - (a.year || 0));
    } else if (activeSort === 'mileage-asc') {
      filtered.sort((a, b) => {
        const mA = parseInt((a.mileage || '0').replace(/[^0-9]/g, ''), 10) || 0;
        const mB = parseInt((b.mileage || '0').replace(/[^0-9]/g, ''), 10) || 0;
        return mA - mB;
      });
    }

    // Render items
    if (filtered.length === 0) {
      gridEl.innerHTML = [
        '<div class="empty-state" style="grid-column: 1 / -1;">',
        '  <div class="empty-state-icon">',
        '    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>',
        '  </div>',
        '  <h3>No matching inventory found</h3>',
        '  <p>We could not find items matching your current filters. Try changing your search query or reset all filters to view our full stock.</p>',
        '  <button type="button" class="btn btn-secondary btn-sm" id="resetCatalogFilters">',
        '    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M3 21v-5h5"/></svg>',
        '    <span>Reset All Filters</span>',
        '  </button>',
        '</div>'
      ].join('\n');

      const resetBtn = document.getElementById('resetCatalogFilters');
      if (resetBtn) {
        resetBtn.addEventListener('click', () => {
          if (searchInput) searchInput.value = '';
          if (sortSelect) sortSelect.value = 'default';
          if (stockOnlyCheck) stockOnlyCheck.checked = false;
          activeQuery = '';
          activeSort = 'default';
          inStockOnly = false;
          activeCategory = 'all';
          if (chipsContainer) {
            chipsContainer.querySelectorAll('.chip').forEach(c => {
              c.classList.toggle('active', c.dataset.cat === 'all');
            });
          }
          filterAndRender();
        });
      }
    } else {
      const renderCard = type === 'cars' ? renderVehicleCard : renderSportswearCard;
      gridEl.innerHTML = filtered.map(renderCard).join('');
    }

    // Update count display
    if (countEl) {
      countEl.textContent = 'Showing ' + filtered.length + ' of ' + items.length + ' items';
    }
  }

  // Event Listeners
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      activeQuery = e.target.value;
      filterAndRender();
    });
  }

  if (sortSelect) {
    sortSelect.addEventListener('change', (e) => {
      activeSort = e.target.value;
      filterAndRender();
    });
  }

  if (stockOnlyCheck) {
    stockOnlyCheck.addEventListener('change', (e) => {
      inStockOnly = e.target.checked;
      filterAndRender();
    });
  }

  // Initial render
  filterAndRender();
}
