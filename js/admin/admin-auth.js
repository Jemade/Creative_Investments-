/**
 * Creative Wing Investments — Admin Authentication Controller
 * Manages login validation, session checking, and UI visibility
 */

(function (window) {
  'use strict';

  const AdminAuth = {
    init() {
      this.authScreen = document.getElementById('authScreen');
      this.adminShell = document.getElementById('adminShell');
      this.loginForm = document.getElementById('adminLoginForm');
      this.loginAlert = document.getElementById('adminLoginAlert');
      this.loginBtn = document.getElementById('adminLoginBtn');
      this.logoutBtn = document.getElementById('adminLogoutBtn');
      this.userDisplay = document.getElementById('adminUserDisplay');

      if (this.loginForm) {
        this.loginForm.addEventListener('submit', (e) => this.handleLogin(e));
      }

      if (this.logoutBtn) {
        this.logoutBtn.addEventListener('click', () => this.handleLogout());
      }

      // Password visibility eye toggle
      const passwordToggleBtn = document.getElementById('adminPasswordToggle');
      const passwordInput = document.getElementById('adminPassword');
      const eyeOpen = document.getElementById('eyeIconOpen');
      const eyeClosed = document.getElementById('eyeIconClosed');

      if (passwordToggleBtn && passwordInput) {
        passwordToggleBtn.addEventListener('click', (e) => {
          e.preventDefault();
          const isPassword = passwordInput.getAttribute('type') === 'password';
          passwordInput.setAttribute('type', isPassword ? 'text' : 'password');
          if (eyeOpen && eyeClosed) {
            eyeOpen.style.display = isPassword ? 'none' : 'block';
            eyeClosed.style.display = isPassword ? 'block' : 'none';
          }
        });
      }

      // Check session on startup
      this.checkSession();
    },

    async checkSession() {
      const auth = await window.adminApi.verify();

      if (auth && auth.authenticated) {
        this.showShell(auth.user);
      } else {
        this.showLogin();
      }
    },

    async handleLogin(e) {
      e.preventDefault();
      const usernameInput = document.getElementById('adminUsername');
      const passwordInput = document.getElementById('adminPassword');
      const rememberInput = document.getElementById('adminRememberMe');

      const username = usernameInput ? usernameInput.value.trim() : '';
      const password = passwordInput ? passwordInput.value : '';
      const remember = rememberInput ? rememberInput.checked : false;

      if (!username || !password) {
        this.showAlert('Please enter your authorized email address and password.');
        return;
      }

      // Ensure valid username or email address format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(username) && username.toLowerCase() !== 'owner') {
        this.showAlert('Please enter a valid administrator email address or username.');
        if (usernameInput) usernameInput.focus();
        return;
      }

      this.hideAlert();
      this.setLoading(true);

      try {
        const res = await window.adminApi.login(username, password, remember);
        if (res.success) {
          if (passwordInput) passwordInput.value = '';
          this.showShell(res.user);
          if (window.adminApp && window.adminApp.onAuthenticated) {
            window.adminApp.onAuthenticated();
          }
        } else {
          this.showAlert(res.error || 'Invalid credentials.');
        }
      } catch (err) {
        this.showAlert(err.message || 'Authentication error. Please check your credentials.');
      } finally {
        this.setLoading(false);
      }
    },

    async handleLogout() {
      window.adminModal.confirm({
        title: 'Sign Out of Creative Wing Admin?',
        message: 'Are you sure you want to log out? Any unsaved edits will not be recorded.',
        confirmText: 'Sign Out',
        confirmClass: 'admin-btn-danger',
        type: 'warning',
        onConfirm: async () => {
          await window.adminApi.logout();
          this.showLogin();
          if (window.adminApp) {
            window.adminApp.showToast('You have signed out successfully.', 'success');
          }
        }
      });
    },

    showLogin() {
      if (this.authScreen) this.authScreen.style.display = 'flex';
      if (this.adminShell) this.adminShell.style.display = 'none';
      document.body.classList.remove('admin-authenticated');
    },

    showShell(user) {
      if (this.authScreen) this.authScreen.style.display = 'none';
      if (this.adminShell) this.adminShell.style.display = 'flex';
      document.body.classList.add('admin-authenticated');

      if (this.userDisplay && user) {
        this.userDisplay.textContent = user.displayName || user.username || 'Owner';
      }
    },

    showAlert(msg) {
      if (this.loginAlert) {
        this.loginAlert.textContent = msg;
        this.loginAlert.classList.add('show');
      }
    },

    hideAlert() {
      if (this.loginAlert) {
        this.loginAlert.classList.remove('show');
      }
    },

    setLoading(isLoading) {
      if (this.loginBtn) {
        this.loginBtn.disabled = isLoading;
        this.loginBtn.innerHTML = isLoading
          ? '<span>Authenticating...</span>'
          : '<span>Sign In to Admin</span><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>';
      }
    }
  };

  window.adminAuth = AdminAuth;
})(window);
