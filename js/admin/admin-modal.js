/**
 * Creative Wing Investments — Admin Modal & Dialog Controller
 * Manages modal visibility, accessible keyboard interactions, and destructive confirmation modals
 */

(function (window) {
  'use strict';

  const AdminModal = {
    isDirty: false,

    init() {
      // Close on backdrop click
      document.querySelectorAll('.admin-modal-backdrop').forEach(backdrop => {
        backdrop.addEventListener('click', (e) => {
          if (e.target === backdrop) {
            this.handleBackdropClose(backdrop.id);
          }
        });
      });

      // Close on Escape key
      window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          const openBackdrop = document.querySelector('.admin-modal-backdrop.show');
          if (openBackdrop) {
            this.handleBackdropClose(openBackdrop.id);
          }
        }
      });
    },

    open(modalId) {
      const el = document.getElementById(modalId);
      if (el) {
        el.classList.add('show');
        document.body.style.overflow = 'hidden';
      }
    },

    close(modalId) {
      const el = document.getElementById(modalId);
      if (el) {
        el.classList.remove('show');
        // Restore overflow only if no other modal is open
        if (!document.querySelector('.admin-modal-backdrop.show')) {
          document.body.style.overflow = '';
        }
      }
      this.isDirty = false;
    },

    handleBackdropClose(modalId) {
      if (this.isDirty) {
        this.confirm({
          title: 'Discard Unsaved Changes?',
          message: 'You have unsaved changes in this form. If you close now, your changes will be lost.',
          confirmText: 'Discard & Close',
          confirmClass: 'admin-btn-danger',
          type: 'warning',
          onConfirm: () => {
            this.clearDirty();
            this.close(modalId);
          }
        });
        return;
      }
      this.close(modalId);
    },

    markDirty() {
      this.isDirty = true;
    },

    clearDirty() {
      this.isDirty = false;
    },

    confirm(options) {
      const {
        title = 'Confirm Action',
        message = 'Are you sure you want to proceed?',
        confirmText = 'Confirm',
        confirmClass = 'admin-btn-danger',
        type = 'danger',
        onConfirm
      } = options;

      const confirmModal = document.getElementById('confirmModal');
      const titleEl = document.getElementById('confirmModalTitle');
      const msgEl = document.getElementById('confirmModalMessage');
      const actionBtn = document.getElementById('confirmModalActionBtn');
      const badgeEl = document.getElementById('confirmModalIconBadge');

      if (!confirmModal) {
        if (typeof onConfirm === 'function') onConfirm();
        return;
      }

      if (titleEl) titleEl.textContent = title;
      if (msgEl) msgEl.textContent = message;

      if (badgeEl) {
        badgeEl.className = `admin-confirm-icon-badge ${type}`;
        if (type === 'danger') {
          badgeEl.innerHTML = '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>';
        } else if (type === 'warning') {
          badgeEl.innerHTML = '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>';
        } else {
          badgeEl.innerHTML = '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>';
        }
      }

      if (actionBtn) {
        actionBtn.textContent = confirmText;
        actionBtn.className = `admin-btn ${confirmClass}`;
        
        // Clone button to strip existing listeners
        const newBtn = actionBtn.cloneNode(true);
        actionBtn.parentNode.replaceChild(newBtn, actionBtn);

        newBtn.addEventListener('click', () => {
          this.close('confirmModal');
          if (typeof onConfirm === 'function') {
            onConfirm();
          }
        });
      }

      this.open('confirmModal');
    }
  };

  window.adminModal = AdminModal;
})(window);
