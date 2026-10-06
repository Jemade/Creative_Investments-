/**
 * Creative Wing Investments — Universal Inventory Service
 * Single authoritative source of truth for public catalogs and admin management.
 * Provides clean async abstractions with persistent server REST API and resilient offline fallback.
 */

(function (window) {
  'use strict';

  const API_BASE = '/api/inventory';

  const InventoryService = {
    /**
     * Get all vehicles
     * @returns {Promise<Array>}
     */
    async getVehicles() {
      try {
        const res = await fetch(`${API_BASE}/vehicles`, { cache: 'no-store' });
        if (res.ok) {
          const vehicles = await res.json();
          // Sync with local memory and storage
          this.syncLocalVehicles(vehicles);
          return vehicles;
        }
      } catch (e) {
        // Fallback to local storage / memory if server is not reachable
        console.warn('InventoryService: Server API unreachable, using local fallback.', e.message);
      }
      return this.getLocalVehicles();
    },

    /**
     * Get all sportswear products
     * @returns {Promise<Array>}
     */
    async getSportswear() {
      try {
        const res = await fetch(`${API_BASE}/sportswear`, { cache: 'no-store' });
        if (res.ok) {
          const items = await res.json();
          this.syncLocalSportswear(items);
          return items;
        }
      } catch (e) {
        console.warn('InventoryService: Server API unreachable, using local fallback.', e.message);
      }
      return this.getLocalSportswear();
    },

    /**
     * Save vehicle (create or update)
     * @param {Object} vehicle 
     * @param {string} token 
     * @returns {Promise<Object>}
     */
    async saveVehicle(vehicle, token) {
      const isNew = !vehicle.id || vehicle.id.startsWith('temp_');
      const url = isNew ? `${API_BASE}/vehicles` : `${API_BASE}/vehicles/${encodeURIComponent(vehicle.id)}`;
      const method = isNew ? 'POST' : 'PUT';

      try {
        const res = await fetch(url, {
          method,
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(vehicle)
        });

        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || `HTTP ${res.status}`);
        }

        const data = await res.json();
        const saved = data.vehicle;

        // Update local cache
        const local = this.getLocalVehicles();
        if (isNew) {
          local.unshift(saved);
        } else {
          const idx = local.findIndex(v => v.id === saved.id);
          if (idx !== -1) local[idx] = saved;
          else local.unshift(saved);
        }
        this.syncLocalVehicles(local);

        return saved;
      } catch (e) {
        // Fallback: save to localStorage if offline
        console.warn('InventoryService: Saving to local storage only:', e.message);
        const local = this.getLocalVehicles();
        if (isNew) {
          vehicle.id = 'C' + String(Date.now()).slice(-4);
          vehicle.createdAt = new Date().toISOString();
          vehicle.updatedAt = vehicle.createdAt;
          local.unshift(vehicle);
        } else {
          vehicle.updatedAt = new Date().toISOString();
          const idx = local.findIndex(v => v.id === vehicle.id);
          if (idx !== -1) local[idx] = vehicle;
        }
        this.syncLocalVehicles(local);
        return vehicle;
      }
    },

    /**
     * Delete vehicle
     * @param {string} id 
     * @param {string} token 
     * @returns {Promise<boolean>}
     */
    async deleteVehicle(id, token) {
      try {
        const res = await fetch(`${API_BASE}/vehicles/${encodeURIComponent(id)}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || `HTTP ${res.status}`);
        }
      } catch (e) {
        console.warn('InventoryService: Deleting from local storage only:', e.message);
      }

      const local = this.getLocalVehicles().filter(v => v.id !== id);
      this.syncLocalVehicles(local);
      return true;
    },

    /**
     * Save sportswear product (create or update)
     * @param {Object} item 
     * @param {string} token 
     * @returns {Promise<Object>}
     */
    async saveSportswear(item, token) {
      const isNew = !item.id || item.id.startsWith('temp_');
      const url = isNew ? `${API_BASE}/sportswear` : `${API_BASE}/sportswear/${encodeURIComponent(item.id)}`;
      const method = isNew ? 'POST' : 'PUT';

      try {
        const res = await fetch(url, {
          method,
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(item)
        });

        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || `HTTP ${res.status}`);
        }

        const data = await res.json();
        const saved = data.product;

        const local = this.getLocalSportswear();
        if (isNew) {
          local.unshift(saved);
        } else {
          const idx = local.findIndex(s => s.id === saved.id);
          if (idx !== -1) local[idx] = saved;
          else local.unshift(saved);
        }
        this.syncLocalSportswear(local);

        return saved;
      } catch (e) {
        console.warn('InventoryService: Saving sportswear to local storage only:', e.message);
        const local = this.getLocalSportswear();
        if (isNew) {
          item.id = 'S' + String(Date.now()).slice(-4);
          item.createdAt = new Date().toISOString();
          item.updatedAt = item.createdAt;
          local.unshift(item);
        } else {
          item.updatedAt = new Date().toISOString();
          const idx = local.findIndex(s => s.id === item.id);
          if (idx !== -1) local[idx] = item;
        }
        this.syncLocalSportswear(local);
        return item;
      }
    },

    /**
     * Delete sportswear product
     * @param {string} id 
     * @param {string} token 
     * @returns {Promise<boolean>}
     */
    async deleteSportswear(id, token) {
      try {
        const res = await fetch(`${API_BASE}/sportswear/${encodeURIComponent(id)}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || `HTTP ${res.status}`);
        }
      } catch (e) {
        console.warn('InventoryService: Deleting sportswear from local storage only:', e.message);
      }

      const local = this.getLocalSportswear().filter(s => s.id !== id);
      this.syncLocalSportswear(local);
      return true;
    },

    /**
     * Upload photographic asset
     * @param {string} dataUrl 
     * @param {string} folder 
     * @param {string} filename 
     * @param {string} token 
     * @returns {Promise<string>} public URL of uploaded image
     */
    async uploadImage(dataUrl, folder, filename, token) {
      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ dataUrl, folder, filename })
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Upload failed');
      }

      const data = await res.json();
      return data.url;
    },

    // --- Local storage synchronization ---
    getLocalVehicles() {
      try {
        const s = localStorage.getItem('CWI_CARS');
        if (s) return JSON.parse(s);
      } catch (e) {}
      return (typeof DEFAULT_CARS !== 'undefined') ? DEFAULT_CARS : [];
    },

    syncLocalVehicles(vehicles) {
      try {
        localStorage.setItem('CWI_CARS', JSON.stringify(vehicles));
        if (typeof window !== 'undefined') {
          window.CARS = vehicles;
        }
      } catch (e) {}
    },

    getLocalSportswear() {
      try {
        const s = localStorage.getItem('CWI_SPORTSWEAR');
        if (s) return JSON.parse(s);
      } catch (e) {}
      return (typeof DEFAULT_SPORTSWEAR !== 'undefined') ? DEFAULT_SPORTSWEAR : [];
    },

    syncLocalSportswear(sportswear) {
      try {
        localStorage.setItem('CWI_SPORTSWEAR', JSON.stringify(sportswear));
        if (typeof window !== 'undefined') {
          window.SPORTSWEAR = sportswear;
        }
      } catch (e) {}
    }
  };

  window.inventoryService = InventoryService;
})(window);
