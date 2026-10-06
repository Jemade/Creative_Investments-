/**
 * Creative Wing Investments — Main Admin Controller & Router
 * Orchestrates views, data synchronization, mobile navigation, and toast notifications
 */

(function (window) {
  'use strict';

  const AdminApp = {
    vehicles: [],
    sportswear: [],
    currentView: 'dashboard',

    async init() {
      // 1. Initialize sub-controllers
      if (window.adminAuth) window.adminAuth.init();
      if (window.adminModal) window.adminModal.init();
      if (window.adminVehicles) window.adminVehicles.init();
      if (window.adminSportswear) window.adminSportswear.init();

      // 2. Setup navigation routing
      this.setupNavigation();

      // 3. Setup mobile sidebar
      this.setupMobileSidebar();
    },

    async onAuthenticated() {
      await this.loadAllData();
      this.switchView('dashboard');
    },

    async loadAllData() {
      try {
        const [vList, swList] = await Promise.all([
          window.adminApi.getVehicles(),
          window.adminApi.getSportswear()
        ]);

        this.vehicles = vList || [];
        this.sportswear = swList || [];

        // Distribute to controllers
        if (window.adminVehicles) window.adminVehicles.setVehicles(this.vehicles);
        if (window.adminSportswear) window.adminSportswear.setSportswear(this.sportswear);
        if (window.adminDashboard) window.adminDashboard.render(this.vehicles, this.sportswear);
      } catch (err) {
        console.error('Failed to load inventory data:', err);
        this.showToast('Could not load inventory: ' + err.message, 'error');
      }
    },

    setupNavigation() {
      const navLinks = document.querySelectorAll('.admin-nav-item[data-view]');
      navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
          e.preventDefault();
          const targetView = link.dataset.view;
          this.switchView(targetView);

          // Close mobile sidebar if open
          this.closeSidebar();
        });
      });
    },

    switchView(viewName) {
      this.currentView = viewName;

      // Update nav link active states
      document.querySelectorAll('.admin-nav-item').forEach(link => {
        link.classList.toggle('active', link.dataset.view === viewName);
      });

      // Update view container visibility
      document.querySelectorAll('.admin-view').forEach(view => {
        view.classList.toggle('active', view.id === `view-${viewName}`);
      });

      // Update topbar title
      const titleEl = document.getElementById('adminTopbarTitle');
      if (titleEl) {
        const titles = {
          dashboard: 'Operational Dashboard',
          vehicles: 'Vehicle Fleet Inventory',
          sportswear: 'Sportswear & Apparel Catalog',
          settings: 'Operational Settings'
        };
        titleEl.textContent = titles[viewName] || 'Administration';
      }

      // Refresh view-specific rendering
      if (viewName === 'dashboard' && window.adminDashboard) {
        window.adminDashboard.render(this.vehicles, this.sportswear);
      }
    },

    editItem(itemType, id) {
      if (itemType === 'Vehicle') {
        this.switchView('vehicles');
        if (window.adminVehicles) window.adminVehicles.openEditModal(id);
      } else if (itemType === 'Sportswear') {
        this.switchView('sportswear');
        if (window.adminSportswear) window.adminSportswear.openEditModal(id);
      }
    },

    setupMobileSidebar() {
      const toggleBtn = document.getElementById('adminToggleSidebar');
      const sidebar = document.getElementById('adminSidebar');
      const backdrop = document.getElementById('adminSidebarBackdrop');

      if (toggleBtn && sidebar) {
        toggleBtn.addEventListener('click', () => {
          sidebar.classList.toggle('open');
        });
      }

      if (backdrop) {
        backdrop.addEventListener('click', () => {
          this.closeSidebar();
        });
      }
    },

    closeSidebar() {
      const sidebar = document.getElementById('adminSidebar');
      if (sidebar) sidebar.classList.remove('open');
    },

    showToast(message, type = 'success') {
      const toast = document.getElementById('adminToast');
      const textEl = document.getElementById('adminToastText');
      const iconEl = document.getElementById('adminToastIcon');

      if (!toast) return;

      if (textEl) textEl.textContent = message;

      toast.className = `admin-toast toast-${type} show`;

      if (iconEl) {
        iconEl.innerHTML = type === 'success'
          ? '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>'
          : '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>';
      }

      clearTimeout(this._toastTimer);
      this._toastTimer = setTimeout(() => {
        toast.classList.remove('show');
      }, 3600);
    }
  };

  window.adminApp = AdminApp;

  document.addEventListener('DOMContentLoaded', () => {
    AdminApp.init();
  });
})(window);
