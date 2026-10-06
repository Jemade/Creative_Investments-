/**
 * Creative Wing Investments — Admin Validation Utility
 * Validates inventory data structures with human-readable error messages
 */

(function (window) {
  'use strict';

  const AdminValidation = {
    validateVehicle(data) {
      const errors = [];

      if (!data.name || !data.name.trim()) {
        errors.push('Vehicle title / display name is required.');
      }

      if (data.price === undefined || data.price === null || String(data.price).trim() === '') {
        errors.push('Vehicle price is required.');
      } else {
        const num = Number(data.price);
        if (isNaN(num) || num < 0) {
          errors.push('Vehicle price must be a valid positive USD amount.');
        }
      }

      if (data.year) {
        const yr = Number(data.year);
        if (isNaN(yr) || yr < 1990 || yr > new Date().getFullYear() + 2) {
          errors.push(`Model year must be between 1990 and ${new Date().getFullYear() + 1}.`);
        }
      }

      if (!data.category) {
        errors.push('Vehicle category is required.');
      }

      if (!data.status) {
        errors.push('Vehicle status is required (Available, Reserved, or Sold).');
      }

      return {
        isValid: errors.length === 0,
        errors
      };
    },

    validateSportswear(data) {
      const errors = [];

      if (!data.name || !data.name.trim()) {
        errors.push('Product name is required.');
      }

      if (data.price === undefined || data.price === null || String(data.price).trim() === '') {
        errors.push('Product price is required.');
      } else {
        const num = Number(data.price);
        if (isNaN(num) || num < 0) {
          errors.push('Product price must be a valid positive USD amount.');
        }
      }

      if (!data.category) {
        errors.push('Sportswear category is required.');
      }

      if (!Array.isArray(data.sizes) || data.sizes.length === 0) {
        errors.push('Please select at least one available size (e.g. S, M, L).');
      }

      if (!data.status) {
        errors.push('Product availability status is required.');
      }

      return {
        isValid: errors.length === 0,
        errors
      };
    }
  };

  window.adminValidation = AdminValidation;
})(window);
