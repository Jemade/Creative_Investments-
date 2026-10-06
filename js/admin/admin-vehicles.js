/**
 * Creative Wing Investments — Admin Vehicles Controller
 * Handles Vehicle CRUD, image management, feature tags, and status updates
 */

(function (window) {
  'use strict';

  const AdminVehicles = {
    vehicles: [],
    currentEditingId: null,
    currentGallery: [],
    currentFeatures: [],
    activeFilter: 'all',
    activeSearch: '',

    init() {
      this.tableBody = document.getElementById('vehiclesTableBody');
      this.modal = document.getElementById('vehicleModal');
      this.form = document.getElementById('vehicleForm');
      this.saveBtn = document.getElementById('btnSaveVehicle');
      this.searchInput = document.getElementById('vehicleSearchInput');
      this.pillsContainer = document.getElementById('vehicleFilterPills');

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
        // Track dirty changes
        this.form.addEventListener('input', () => window.adminModal.markDirty());
      }

      // Feature tag input
      const addFeatureBtn = document.getElementById('btnAddVehicleFeature');
      const featureInput = document.getElementById('vehicleFeatureInput');
      if (addFeatureBtn && featureInput) {
        const addFeature = () => {
          const val = featureInput.value.trim();
          if (val && !this.currentFeatures.includes(val)) {
            this.currentFeatures.push(val);
            featureInput.value = '';
            this.renderFeatureTags();
            window.adminModal.markDirty();
          }
        };
        addFeatureBtn.addEventListener('click', addFeature);
        featureInput.addEventListener('keydown', (e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            addFeature();
          }
        });
      }

      // Image upload box
      const uploadBox = document.getElementById('vehicleUploadBox');
      const fileInput = document.getElementById('vehicleFileInput');
      if (uploadBox && fileInput) {
        uploadBox.addEventListener('click', () => fileInput.click());
        fileInput.addEventListener('change', (e) => this.handleFileUpload(e));
      }

      // Add image via URL button
      const btnAddImageUrl = document.getElementById('btnAddVehicleImageUrl');
      const imageUrlInput = document.getElementById('vehicleImageUrlInput');
      if (btnAddImageUrl && imageUrlInput) {
        btnAddImageUrl.addEventListener('click', () => {
          const url = imageUrlInput.value.trim();
          if (url) {
            this.currentGallery.push(url);
            imageUrlInput.value = '';
            this.renderGallery();
            window.adminModal.markDirty();
          }
        });
      }
    },

    setVehicles(list) {
      this.vehicles = Array.isArray(list) ? list : [];
      this.renderTable();
    },

    renderTable() {
      if (!this.tableBody) return;

      const filtered = this.vehicles.filter(v => {
        // Status or Category filter
        if (this.activeFilter !== 'all') {
          const matchesStatus = v.status && v.status.toLowerCase() === this.activeFilter.toLowerCase();
          const matchesCategory = (v.category && v.category.toLowerCase() === this.activeFilter.toLowerCase()) ||
                                  (v.body && v.body.toLowerCase() === this.activeFilter.toLowerCase());
          if (!matchesStatus && !matchesCategory) return false;
        }

        // Text search
        if (this.activeSearch) {
          const q = this.activeSearch;
          const matchName = v.name && v.name.toLowerCase().includes(q);
          const matchId = v.id && v.id.toLowerCase().includes(q);
          const matchYear = v.year && String(v.year).includes(q);
          const matchCategory = v.category && v.category.toLowerCase().includes(q);
          if (!matchName && !matchId && !matchYear && !matchCategory) return false;
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
              <h4>No matching vehicles found</h4>
              <p>Try adjusting your search criteria or filter pills, or click "Add Vehicle" to register new stock.</p>
            </td>
          </tr>
        `;
        return;
      }

      this.tableBody.innerHTML = filtered.map(v => {
        const badgeClass = v.status === 'Available' ? 'admin-badge-available' : v.status === 'Reserved' ? 'admin-badge-reserved' : 'admin-badge-sold';
        const dateStr = v.updatedAt ? new Date(v.updatedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Initial Seed';
        const thumbImg = v.image || (v.gallery && v.gallery[0]) || 'images/logo.jpeg';

        return `
          <tr data-id="${v.id}">
            <td class="admin-thumb-cell">
              <img src="${thumbImg}" class="admin-table-thumb" alt="${v.name}" onerror="this.src='images/logo.jpeg'">
              <div>
                <div class="admin-item-title">${v.name}</div>
                <div class="admin-item-subtitle">${v.transmission || 'Automatic'} • ${v.fuel || 'Diesel'} • ID ${v.id}</div>
              </div>
            </td>
            <td data-label="Year">${v.year || 'N/A'}</td>
            <td data-label="Category">${v.category || v.body || 'SUV'}</td>
            <td data-label="Price"><span class="admin-price-badge"><small>$</small>${Number(v.price || 0).toLocaleString('en-US')} USD</span></td>
            <td data-label="Mileage">${v.mileage || 'Verified'}</td>
            <td data-label="Status"><span class="admin-badge ${badgeClass}"><span class="admin-badge-dot"></span>${v.status || 'Available'}</span></td>
            <td data-label="Updated" style="color:#94A3B8;font-size:0.82rem">${dateStr}</td>
            <td data-label="Actions">
              <div class="admin-table-actions">
                <button type="button" class="admin-action-btn btn-edit" onclick="adminVehicles.openEditModal('${v.id}')">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                  <span>Edit</span>
                </button>
                <button type="button" class="admin-action-btn btn-delete" onclick="adminVehicles.confirmDelete('${v.id}')">
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
      this.currentFeatures = ['Air Conditioning', 'Power Steering', 'Central Locking'];

      document.getElementById('vehicleModalTitle').textContent = 'Add New Vehicle';
      this.form.reset();

      // Defaults
      document.getElementById('vStatus').value = 'Available';
      document.getElementById('vCategory').value = 'SUV';
      document.getElementById('vTransmission').value = 'Automatic';
      document.getElementById('vFuel').value = 'Petrol';
      document.getElementById('vDrivetrain').value = '2WD';
      document.getElementById('vYear').value = new Date().getFullYear();

      this.renderGallery();
      this.renderFeatureTags();
      window.adminModal.clearDirty();
      window.adminModal.open('vehicleModal');
    },

    openEditModal(id) {
      const v = this.vehicles.find(item => item.id === id);
      if (!v) return;

      this.currentEditingId = id;
      document.getElementById('vehicleModalTitle').textContent = `Edit: ${v.name}`;

      document.getElementById('vName').value = v.name || '';
      document.getElementById('vPrice').value = v.price !== undefined ? v.price : '';
      document.getElementById('vYear').value = v.year || '';
      document.getElementById('vCategory').value = v.category || v.body || 'SUV';
      document.getElementById('vStatus').value = v.status || (v.inStock ? 'Available' : 'Sold');
      document.getElementById('vMileage').value = v.mileage || '';
      document.getElementById('vTransmission').value = v.transmission || 'Automatic';
      document.getElementById('vFuel').value = v.fuel || 'Diesel';
      document.getElementById('vDrivetrain').value = v.drivetrain || '4WD';
      document.getElementById('vColor').value = v.color || '';
      document.getElementById('vDescription').value = v.description || '';

      this.currentFeatures = Array.isArray(v.features) ? [...v.features] : [];
      this.currentGallery = Array.isArray(v.gallery) && v.gallery.length ? [...v.gallery] : (v.image ? [v.image] : []);

      this.renderGallery();
      this.renderFeatureTags();
      window.adminModal.clearDirty();
      window.adminModal.open('vehicleModal');
    },

    renderFeatureTags() {
      const wrap = document.getElementById('vehicleTagsWrap');
      if (!wrap) return;

      wrap.innerHTML = this.currentFeatures.map((feat, idx) => `
        <span class="admin-tag-chip">
          <span>${feat}</span>
          <button type="button" class="admin-tag-remove" onclick="adminVehicles.removeFeature(${idx})">&times;</button>
        </span>
      `).join('');
    },

    removeFeature(idx) {
      this.currentFeatures.splice(idx, 1);
      this.renderFeatureTags();
      window.adminModal.markDirty();
    },

    renderGallery() {
      const container = document.getElementById('vehicleGalleryGrid');
      if (!container) return;

      if (!this.currentGallery.length) {
        container.innerHTML = `<span style="font-size:0.85rem;color:#94A3B8;grid-column:1/-1">No photos added yet. Upload files below or paste image URLs.</span>`;
        return;
      }

      container.innerHTML = this.currentGallery.map((url, idx) => `
        <div class="admin-image-item ${idx === 0 ? 'primary' : ''}">
          <img src="${url}" alt="Vehicle photo ${idx + 1}" onerror="this.src='images/logo.jpeg'">
          ${idx === 0 ? '<span class="admin-image-primary-badge">Primary</span>' : ''}
          <div class="admin-image-actions">
            ${idx !== 0 ? `<button type="button" class="admin-img-action-btn" title="Set as Primary" onclick="adminVehicles.setPrimaryImage(${idx})"><svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg></button>` : ''}
            <button type="button" class="admin-img-action-btn btn-img-delete" title="Remove Photo" onclick="adminVehicles.removeImage(${idx})"><svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
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
            const url = await window.adminApi.uploadImage(dataUrl, 'cars', file.name);
            this.currentGallery.push(url);
            this.renderGallery();
            window.adminModal.markDirty();
          } catch (err) {
            // If upload API is unavailable, fallback to base64 dataUrl directly
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
        name: document.getElementById('vName').value.trim(),
        price: Number(document.getElementById('vPrice').value),
        year: Number(document.getElementById('vYear').value),
        category: document.getElementById('vCategory').value,
        status: document.getElementById('vStatus').value,
        mileage: document.getElementById('vMileage').value.trim(),
        transmission: document.getElementById('vTransmission').value,
        fuel: document.getElementById('vFuel').value,
        drivetrain: document.getElementById('vDrivetrain').value,
        color: document.getElementById('vColor').value.trim(),
        description: document.getElementById('vDescription').value.trim(),
        features: [...this.currentFeatures],
        gallery: [...this.currentGallery],
        image: this.currentGallery[0] || 'images/cars/01.jpeg'
      };

      const val = window.adminValidation.validateVehicle(payload);
      if (!val.isValid) {
        window.adminApp.showToast(val.errors[0] || 'Please complete all required fields correctly.', 'error');
        return;
      }

      this.saveBtn.disabled = true;
      this.saveBtn.textContent = 'Saving...';

      try {
        const saved = await window.adminApi.saveVehicle(payload);
        window.adminApp.showToast(`Vehicle "${saved.name}" saved successfully!`, 'success');

        window.adminModal.clearDirty();
        window.adminModal.close('vehicleModal');

        // Refresh dataset
        await window.adminApp.loadAllData();
      } catch (err) {
        window.adminApp.showToast('Failed to save vehicle: ' + err.message, 'error');
      } finally {
        this.saveBtn.disabled = false;
        this.saveBtn.textContent = 'Save Vehicle';
      }
    },

    confirmDelete(id) {
      const v = this.vehicles.find(item => item.id === id);
      if (!v) return;

      window.adminModal.confirm({
        title: 'Delete Vehicle Record?',
        message: `Are you sure you want to permanently remove "${v.name}" (ID ${v.id})? This will immediately remove it from the public catalog.`,
        confirmText: 'Delete Vehicle',
        confirmClass: 'admin-btn-danger',
        type: 'danger',
        onConfirm: async () => {
          try {
            await window.adminApi.deleteVehicle(id);
            window.adminApp.showToast(`Vehicle "${v.name}" removed from inventory.`, 'success');
            await window.adminApp.loadAllData();
          } catch (err) {
            window.adminApp.showToast('Failed to delete vehicle: ' + err.message, 'error');
          }
        }
      });
    },

    previewCurrent() {
      const payload = {
        id: this.currentEditingId || 'CW-PREVIEW',
        name: document.getElementById('vName').value.trim() || 'Untitled Vehicle',
        price: Number(document.getElementById('vPrice').value) || 0,
        year: Number(document.getElementById('vYear').value) || new Date().getFullYear(),
        category: document.getElementById('vCategory').value || 'SUV',
        body: document.getElementById('vCategory').value || 'SUV',
        status: document.getElementById('vStatus').value || 'Available',
        inStock: document.getElementById('vStatus').value === 'Available',
        mileage: document.getElementById('vMileage').value.trim() || 'N/A',
        transmission: document.getElementById('vTransmission').value || 'Automatic',
        fuel: document.getElementById('vFuel').value || 'Diesel',
        drivetrain: document.getElementById('vDrivetrain').value || '4WD',
        color: document.getElementById('vColor').value.trim() || 'Standard',
        description: document.getElementById('vDescription').value.trim() || 'Inspected and ready for viewing in Harare.',
        features: [...this.currentFeatures],
        gallery: this.currentGallery.length ? [...this.currentGallery] : ['images/cars/01.jpeg'],
        image: this.currentGallery.length ? this.currentGallery[0] : 'images/cars/01.jpeg'
      };

      if (typeof CARS !== 'undefined') {
        const existingIdx = CARS.findIndex(c => c.id === payload.id);
        if (existingIdx >= 0) {
          CARS[existingIdx] = payload;
        } else {
          CARS.push(payload);
        }
      }

      if (typeof openVehicleModal === 'function') {
        openVehicleModal(payload.id);
      } else {
        window.adminApp.showToast('Showroom preview modal initialized.', 'info');
      }
    }
  };

  window.adminVehicles = AdminVehicles;
})(window);
