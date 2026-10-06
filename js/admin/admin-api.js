/**
 * Creative Wing Investments — Admin API Client
 * Manages authenticated communication with the backend REST API
 */

(function (window) {
  'use strict';

  const TOKEN_KEY = 'cwi_admin_token';
  const USER_KEY = 'cwi_admin_user';

  const AdminApi = {
    getToken() {
      return sessionStorage.getItem(TOKEN_KEY) || localStorage.getItem(TOKEN_KEY);
    },

    setToken(token, user, remember = false) {
      if (remember) {
        localStorage.setItem(TOKEN_KEY, token);
        localStorage.setItem(USER_KEY, JSON.stringify(user));
      } else {
        sessionStorage.setItem(TOKEN_KEY, token);
        sessionStorage.setItem(USER_KEY, JSON.stringify(user));
      }
    },

    clearToken() {
      sessionStorage.removeItem(TOKEN_KEY);
      sessionStorage.removeItem(USER_KEY);
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    },

    getUser() {
      try {
        const u = sessionStorage.getItem(USER_KEY) || localStorage.getItem(USER_KEY);
        return u ? JSON.parse(u) : null;
      } catch (e) {
        return null;
      }
    },

    async request(endpoint, options = {}) {
      const headers = {
        'Content-Type': 'application/json',
        ...(options.headers || {})
      };

      const token = this.getToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch(endpoint, {
        ...options,
        headers
      });

      let data;
      try {
        data = await res.json();
      } catch (e) {
        data = {};
      }

      if (!res.ok) {
        throw new Error(data.error || `Request failed with status ${res.status}`);
      }

      return data;
    },

    // --- Authentication ---
    async login(username, password, remember = false) {
      const data = await this.request('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ username, password })
      });

      if (data.success && data.token) {
        this.setToken(data.token, data.user, remember);
      }
      return data;
    },

    async verify() {
      const token = this.getToken();
      if (!token) return { authenticated: false };

      try {
        return await this.request('/api/auth/verify', { method: 'GET' });
      } catch (e) {
        this.clearToken();
        return { authenticated: false };
      }
    },

    async logout() {
      try {
        await this.request('/api/auth/logout', { method: 'POST' });
      } catch (e) {}
      this.clearToken();
    },

    // --- Inventory: Vehicles ---
    async getVehicles() {
      if (window.inventoryService) {
        return await window.inventoryService.getVehicles();
      }
      return await this.request('/api/inventory/vehicles', { method: 'GET' });
    },

    async saveVehicle(vehicle) {
      if (window.inventoryService) {
        return await window.inventoryService.saveVehicle(vehicle, this.getToken());
      }
      const isNew = !vehicle.id;
      const endpoint = isNew ? '/api/inventory/vehicles' : `/api/inventory/vehicles/${encodeURIComponent(vehicle.id)}`;
      const res = await this.request(endpoint, {
        method: isNew ? 'POST' : 'PUT',
        body: JSON.stringify(vehicle)
      });
      return res.vehicle;
    },

    async deleteVehicle(id) {
      if (window.inventoryService) {
        return await window.inventoryService.deleteVehicle(id, this.getToken());
      }
      return await this.request(`/api/inventory/vehicles/${encodeURIComponent(id)}`, { method: 'DELETE' });
    },

    // --- Inventory: Sportswear ---
    async getSportswear() {
      if (window.inventoryService) {
        return await window.inventoryService.getSportswear();
      }
      return await this.request('/api/inventory/sportswear', { method: 'GET' });
    },

    async saveSportswear(item) {
      if (window.inventoryService) {
        return await window.inventoryService.saveSportswear(item, this.getToken());
      }
      const isNew = !item.id;
      const endpoint = isNew ? '/api/inventory/sportswear' : `/api/inventory/sportswear/${encodeURIComponent(item.id)}`;
      const res = await this.request(endpoint, {
        method: isNew ? 'POST' : 'PUT',
        body: JSON.stringify(item)
      });
      return res.product;
    },

    async deleteSportswear(id) {
      if (window.inventoryService) {
        return await window.inventoryService.deleteSportswear(id, this.getToken());
      }
      return await this.request(`/api/inventory/sportswear/${encodeURIComponent(id)}`, { method: 'DELETE' });
    },

    // --- Image Upload ---
    async uploadImage(dataUrl, folder, filename) {
      if (window.inventoryService) {
        return await window.inventoryService.uploadImage(dataUrl, folder, filename, this.getToken());
      }
      const res = await this.request('/api/upload', {
        method: 'POST',
        body: JSON.stringify({ dataUrl, folder, filename })
      });
      return res.url;
    }
  };

  window.adminApi = AdminApi;
})(window);
