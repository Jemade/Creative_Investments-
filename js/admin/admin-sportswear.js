/**
 * Creative Wing Investments — Admin Sportswear Controller
 * Handles Sportswear CRUD, size selections, customization options, and kit image management
 */

(function (window) {
  'use strict';

  const ALL_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

  const AdminSportswear = {
    sportswear: [],
    currentEditingId: null,
    currentGallery: [],
    currentSizes: ['S', 'M', 'L', 'XL', 'XXL'],
    currentCustomizations: ['Custom Name & Number Printing', 'Club Crest Embroidery'],
    activeFilter: 'all',
    activeSearch: '',

    init() {
      this.tableBody = document.getElementById('sportswearTableBody');
      this.modal = document.getElementById('sportswearModal');
      this.form = document.getElementById('sportswearForm');
      this.saveBtn = document.getElementById('btnSaveSportswear');
      this.searchInput = document.getElementById('sportswearSearchInput');
      this.pillsContainer = document.getElementById('sportswearFilterPills');

      if (this.searchInput) {
        this.searchInput.addEventListener('input', (e) => {
          this.activeSearch = e.target.value.toLowerCase().trim();
          this.renderTable();
        });
      }

      if (this.pillsContainer) {
        this.pillsContainer.addEventListener('click', (e) => {
          const pill = e.target.closest('.admin-filter-pill');
          if (!pill) return;
          this.pillsContainer.querySelectorAll('.admin-filter-pill').forEach(p => p.classList.remove('active'));
          pill.classList.add('active');
          this.activeFilter = pill.dataset.filter || 'all';
          this.renderTable();
        });
      }

      if (this.form) {
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));
        this.form.addEventListener('input', () => window.adminModal.markDirty());
      }

      // Sizing checkboxes
      this.renderSizeSelector();

      // Customization checkboxes
      this.renderCustomizationOptions();

      // Upload Box
      const uploadBox = document.getElementById('swUploadBox');
      const fileInput = document.getElementById('swFileInput');
      if (uploadBox && fileInput) {
        uploadBox.addEventListener('click', () => fileInput.click());
        fileInput.addEventListener('change', (e) => this.handleFileUpload(e));
      }

      // Add image via URL
      const btnAddUrl = document.getElementById('btnAddSwImageUrl');
      const urlInput = document.getElementById('swImageUrlInput');
      if (btnAddUrl && urlInput) {
        btnAddUrl.addEventListener('click', () => {
          const url = urlInput.value.trim();
          if (url) {
            this.currentGallery.push(url);
            urlInput.value = '';
            this.renderGallery();
            window.adminModal.markDirty();
          }
        });
      }
    },

    setSportswear(list) {
      this.sportswear = Array.isArray(list) ? list : [];
      this.renderTable();
    },

    renderTable() {
      if (!this.tableBody) return;

      const filtered = this.sportswear.filter(s => {
        if (this.activeFilter !== 'all') {
          const matchesCategory = s.category && s.category.toLowerCase() === this.activeFilter.toLowerCase();
          const matchesStatus = s.status && s.status.toLowerCase() === this.activeFilter.toLowerCase();
          if (!matchesCategory && !matchesStatus) return false;
        }

        if (this.activeSearch) {
          const q = this.activeSearch;
          const matchName = s.name && s.name.toLowerCase().includes(q);
          const matchId = s.id && s.id.toLowerCase().includes(q);
          const matchCat = s.category && s.category.toLowerCase().includes(q);
          const matchColor = s.colorway && s.colorway.toLowerCase().includes(q);
          if (!matchName && !matchId && !matchCat && !matchColor) return false;
        }

        return true;
      });

      if (!filtered.length) {
        this.tableBody.innerHTML = `
          <tr>
            <td colspan="7" class="admin-empty-state">
              <div class="admin-empty-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              </div>
              <h4>No matching sportswear found</h4>
              <p>Try clearing your search query or click "Add Product" to add a new team match set or apparel product.</p>
            </td>
          </tr>
        `;
        return;
      }

      this.tableBody.innerHTML = filtered.map(s => {
        const badgeClass = s.status === 'Available' ? 'admin-badge-available' : 'admin-badge-sold';
        const dateStr = s.updatedAt ? new Date(s.updatedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Initial Seed';
        const thumbImg = s.image || (s.gallery && s.gallery[0]) || 'images/logo.jpeg';
        const sizesStr = Array.isArray(s.sizes) && s.sizes.length ? s.sizes.join(', ') : 'S to XXL';

        return `
          <tr data-id="${s.id}">
            <td class="admin-thumb-cell">
              <img src="${thumbImg}" class="admin-table-thumb" alt="${s.name}" onerror="this.src='images/logo.jpeg'">
              <div>
                <div class="admin-item-title">${s.name}</div>
                <div class="admin-item-subtitle">${s.category || 'Match Set'} • ID ${s.id}</div>
              </div>
            </td>
            <td data-label="Category">${s.category || 'Match Set'}</td>
            <td data-label="Colourway">${s.colorway || 'Standard'}</td>
            <td data-label="Price"><span class="admin-price-badge"><small>$</small>${Number(s.price || 0).toLocaleString('en-US')} USD</span> <small style="color:#94A3B8">${s.pricingUnit ? `(${s.pricingUnit})` : ''}</small></td>
            <td data-label="Sizes">${sizesStr}</td>
            <td data-label="Status"><span class="admin-badge ${badgeClass}"><span class="admin-badge-dot"></span>${s.status || 'Available'}</span></td>
            <td data-label="Updated" style="color:#94A3B8;font-size:0.82rem">${dateStr}</td>
            <td data-label="Actions">
              <div class="admin-table-actions">
                <button type="button" class="admin-action-btn btn-edit" onclick="adminSportswear.openEditModal('${s.id}')">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                  <span>Edit</span>
                </button>
                <button type="button" class="admin-action-btn btn-delete" onclick="adminSportswear.confirmDelete('${s.id}')">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                </button>
              </div>
            </td>
          </tr>
        `;
      }).join('');
    },

    openAddModal() {
      this.currentEditingId = null;
      this.currentGallery = [];
      this.currentSizes = ['S', 'M', 'L', 'XL', 'XXL'];
      this.currentCustomizations = ['Custom Name & Number Printing', 'Club Crest Embroidery'];

      document.getElementById('sportswearModalTitle').textContent = 'Add New Sportswear Product';
      this.form.reset();

      document.getElementById('swStatus').value = 'Available';
      document.getElementById('swCategory').value = 'Match Set';
      document.getElementById('swPricingUnit').value = 'Per Full Set';
      document.getElementById('swMaterial').value = '100% micro-polyester';

      this.renderSizeSelector();
      this.renderCustomizationOptions();
      this.renderGallery();
      window.adminModal.clearDirty();
      window.adminModal.open('sportswearModal');
    },

    openEditModal(id) {
      const s = this.sportswear.find(item => item.id === id);
      if (!s) return;

      this.currentEditingId = id;
      document.getElementById('sportswearModalTitle').textContent = `Edit: ${s.name}`;

      document.getElementById('swName').value = s.name || '';
      document.getElementById('swCategory').value = s.category || 'Match Set';
      document.getElementById('swStatus').value = s.status || (s.inStock ? 'Available' : 'Unavailable');
      document.getElementById('swPrice').value = s.price !== undefined ? s.price : '';
      document.getElementById('swPricingUnit').value = s.pricingUnit || 'Per Full Set';
      document.getElementById('swColorway').value = s.colorway || '';
      document.getElementById('swMaterial').value = s.material || '100% micro-polyester';
      document.getElementById('swDescription').value = s.description || '';

      this.currentSizes = Array.isArray(s.sizes) && s.sizes.length ? [...s.sizes] : ['S', 'M', 'L', 'XL', 'XXL'];
      this.currentCustomizations = Array.isArray(s.customizationOptions) ? [...s.customizationOptions] : [];
      this.currentGallery = Array.isArray(s.gallery) && s.gallery.length ? [...s.gallery] : (s.image ? [s.image] : []);

      this.renderSizeSelector();
      this.renderCustomizationOptions();
      this.renderGallery();
      window.adminModal.clearDirty();
      window.adminModal.open('sportswearModal');
    },

    renderSizeSelector() {
      const wrap = document.getElementById('swSizesWrap');
      if (!wrap) return;

      wrap.innerHTML = ALL_SIZES.map(sz => {
        const isChecked = this.currentSizes.includes(sz);
        return `
          <label class="admin-size-pill-label">
            <input type="checkbox" class="admin-size-checkbox" value="${sz}" ${isChecked ? 'checked' : ''} onchange="adminSportswear.toggleSize('${sz}', this.checked)">
            <span class="admin-size-pill">${sz}</span>
          </label>
        `;
      }).join('');
    },

    toggleSize(size, checked) {
      if (checked) {
        if (!this.currentSizes.includes(size)) this.currentSizes.push(size);
      } else {
        this.currentSizes = this.currentSizes.filter(s => s !== size);
      }
      window.adminModal.markDirty();
    },

    renderCustomizationOptions() {
      const wrap = document.getElementById('swCustomizationWrap');
      if (!wrap) return;

      const opts = [
        'Custom Name & Number Printing',
        'Club Crest Embroidery',
        'Custom Sponsor Branding',
        'Custom Sleeve Badges'
      ];

      wrap.innerHTML = opts.map(opt => {
        const isChecked = this.currentCustomizations.includes(opt);
        return `
          <label class="admin-checkbox-label">
            <input type="checkbox" value="${opt}" ${isChecked ? 'checked' : ''} onchange="adminSportswear.toggleCustomization('${opt}', this.checked)">
            <span>${opt}</span>
          </label>
        `;
      }).join('');
    },

    toggleCustomization(opt, checked) {
      if (checked) {
        if (!this.currentCustomizations.includes(opt)) this.currentCustomizations.push(opt);
      } else {
        this.currentCustomizations = this.currentCustomizations.filter(c => c !== opt);
      }
      window.adminModal.markDirty();
    },

    renderGallery() {
      const container = document.getElementById('swGalleryGrid');
      if (!container) return;

      if (!this.currentGallery.length) {
        container.innerHTML = `<span style="font-size:0.85rem;color:#94A3B8;grid-column:1/-1">No product photos added yet. Upload files below or paste image URLs.</span>`;
        return;
      }

      container.innerHTML = this.currentGallery.map((url, idx) => `
        <div class="admin-image-item ${idx === 0 ? 'primary' : ''}">
          <img src="${url}" alt="Product photo ${idx + 1}" onerror="this.src='images/logo.jpeg'">
          ${idx === 0 ? '<span class="admin-image-primary-badge">Primary</span>' : ''}
          <div class="admin-image-actions">
            ${idx !== 0 ? `<button type="button" class="admin-img-action-btn" title="Set as Primary" onclick="adminSportswear.setPrimaryImage(${idx})"><svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg></button>` : ''}
            <button type="button" class="admin-img-action-btn btn-img-delete" title="Remove Photo" onclick="adminSportswear.removeImage(${idx})"><svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
          </div>
        </div>
      `).join('');
    },

    setPrimaryImage(idx) {
      if (idx > 0 && idx < this.currentGallery.length) {
        const item = this.currentGallery.splice(idx, 1)[0];
        this.currentGallery.unshift(item);
        this.renderGallery();
        window.adminModal.markDirty();
      }
    },

    removeImage(idx) {
      this.currentGallery.splice(idx, 1);
      this.renderGallery();
      window.adminModal.markDirty();
    },

    async handleFileUpload(e) {
      const files = Array.from(e.target.files);
      if (!files.length) return;

      for (const file of files) {
        if (!file.type.startsWith('image/')) continue;
        const reader = new FileReader();
        reader.onload = async (evt) => {
          const dataUrl = evt.target.result;
          try {
            const url = await window.adminApi.uploadImage(dataUrl, 'sportswear', file.name);
            this.currentGallery.push(url);
            this.renderGallery();
            window.adminModal.markDirty();
          } catch (err) {
            this.currentGallery.push(dataUrl);
            this.renderGallery();
            window.adminModal.markDirty();
          }
        };
        reader.readAsDataURL(file);
      }
      e.target.value = '';
    },

    async handleSubmit(e) {
      e.preventDefault();

      const payload = {
        id: this.currentEditingId,
        name: document.getElementById('swName').value.trim(),
        price: Number(document.getElementById('swPrice').value),
        pricingUnit: document.getElementById('swPricingUnit').value,
        category: document.getElementById('swCategory').value,
        status: document.getElementById('swStatus').value,
        colorway: document.getElementById('swColorway').value.trim(),
        material: document.getElementById('swMaterial').value.trim(),
        description: document.getElementById('swDescription').value.trim(),
        sizes: [...this.currentSizes],
        customizationOptions: [...this.currentCustomizations],
        gallery: [...this.currentGallery],
        image: this.currentGallery[0] || 'images/sportswear/01.jpeg'
      };

      const val = window.adminValidation.validateSportswear(payload);
      if (!val.isValid) {
        window.adminApp.showToast(val.errors[0] || 'Please complete all required fields correctly.', 'error');
        return;
      }

      this.saveBtn.disabled = true;
      this.saveBtn.textContent = 'Saving...';

      try {
        const saved = await window.adminApi.saveSportswear(payload);
        window.adminApp.showToast(`Sportswear "${saved.name}" saved successfully!`, 'success');

        window.adminModal.clearDirty();
        window.adminModal.close('sportswearModal');

        await window.adminApp.loadAllData();
      } catch (err) {
        window.adminApp.showToast('Failed to save sportswear product: ' + err.message, 'error');
      } finally {
        this.saveBtn.disabled = false;
        this.saveBtn.textContent = 'Save Product';
      }
    },

    confirmDelete(id) {
      const s = this.sportswear.find(item => item.id === id);
      if (!s) return;

      window.adminModal.confirm({
        title: 'Delete Sportswear Product?',
        message: `Are you sure you want to permanently remove "${s.name}" (ID ${s.id})? This will immediately remove it from the public sportswear catalog.`,
        confirmText: 'Delete Product',
        confirmClass: 'admin-btn-danger',
        type: 'danger',
        onConfirm: async () => {
          try {
            await window.adminApi.deleteSportswear(id);
            window.adminApp.showToast(`Product "${s.name}" removed from inventory.`, 'success');
            await window.adminApp.loadAllData();
          } catch (err) {
            window.adminApp.showToast('Failed to delete sportswear product: ' + err.message, 'error');
          }
        }
      });
    },

    previewCurrent() {
      const payload = {
        id: this.currentEditingId || 'SP-PREVIEW',
        name: document.getElementById('swName').value.trim() || 'Untitled Kit',
        price: Number(document.getElementById('swPrice').value) || 0,
        pricingUnit: document.getElementById('swPricingUnit').value || 'Per Full Set',
        category: document.getElementById('swCategory').value || 'Match Set',
        status: document.getElementById('swStatus').value || 'Available',
        inStock: document.getElementById('swStatus').value === 'Available',
        colorway: document.getElementById('swColorway').value.trim() || 'Standard',
        material: document.getElementById('swMaterial').value.trim() || 'Breathable Match Polyester',
        description: document.getElementById('swDescription').value.trim() || 'Durable, breathable team kit for competitive football, club leagues, and training. Cash on collection in Harare.',
        sizes: [...this.currentSizes],
        customizations: [...this.currentCustomizations],
        gallery: this.currentGallery.length ? [...this.currentGallery] : ['images/sportswear/01.jpeg'],
        image: this.currentGallery.length ? this.currentGallery[0] : 'images/sportswear/01.jpeg'
      };

      if (typeof SPORTSWEAR !== 'undefined') {
        const existingIdx = SPORTSWEAR.findIndex(s => s.id === payload.id);
        if (existingIdx >= 0) {
          SPORTSWEAR[existingIdx] = payload;
        } else {
          SPORTSWEAR.push(payload);
        }
      }

      if (typeof openSportswearModal === 'function') {
        openSportswearModal(payload.id);
      } else {
        window.adminApp.showToast('Showroom preview modal initialized.', 'info');
      }
    }
  };

  window.adminSportswear = AdminSportswear;
})(window);
