/**
 * Creative Wing Investments — Admin Dashboard Overview Controller
 * Computes live operational metrics and renders KPI summaries & activity logs
 */

(function (window) {
  'use strict';

  const AdminDashboard = {
    async render(vehicles = [], sportswear = []) {
      const container = document.getElementById('dashboardMetricsGrid');
      const activityTable = document.getElementById('dashboardActivityBody');

      // 1. Compute Vehicle Metrics
      const totalVehicles = vehicles.length;
      const availVehicles = vehicles.filter(v => v.status === 'Available').length;
      const resVehicles = vehicles.filter(v => v.status === 'Reserved').length;
      const soldVehicles = vehicles.filter(v => v.status === 'Sold').length;

      // 2. Compute Sportswear Metrics
      const totalSW = sportswear.length;
      const availSW = sportswear.filter(s => s.status === 'Available').length;
      const unavailSW = totalSW - availSW;

      // 3. Compute Valuation
      const totalValuation = vehicles.reduce((sum, v) => sum + (Number(v.price) || 0), 0);

      // Render KPI Grid
      if (container) {
        container.innerHTML = `
          <!-- Vehicles KPI -->
          <div class="admin-kpi-card">
            <div class="admin-kpi-top">
              <span class="admin-kpi-label">Vehicle Fleet</span>
              <div class="admin-kpi-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="8" rx="2"/><path d="M5 11l2-6h10l2 6"/><circle cx="7.5" cy="15.5" r="1.5"/><circle cx="16.5" cy="15.5" r="1.5"/></svg>
              </div>
            </div>
            <div class="admin-kpi-value">${totalVehicles}</div>
            <div class="admin-kpi-breakdown">
              <span><b>${availVehicles}</b> Available</span>
              <span><b>${resVehicles}</b> Reserved</span>
              <span><b>${soldVehicles}</b> Sold</span>
            </div>
          </div>

          <!-- Sportswear KPI -->
          <div class="admin-kpi-card">
            <div class="admin-kpi-top">
              <span class="admin-kpi-label">Sportswear Products</span>
              <div class="admin-kpi-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.38 3.46L16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99.84H6v10a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23z"/></svg>
              </div>
            </div>
            <div class="admin-kpi-value">${totalSW}</div>
            <div class="admin-kpi-breakdown">
              <span><b>${availSW}</b> Active Sets</span>
              <span><b>${unavailSW}</b> Unavailable</span>
            </div>
          </div>

          <!-- Fleet Valuation KPI -->
          <div class="admin-kpi-card">
            <div class="admin-kpi-top">
              <span class="admin-kpi-label">Total Fleet Valuation</span>
              <div class="admin-kpi-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
              </div>
            </div>
            <div class="admin-kpi-value">$${totalValuation.toLocaleString('en-US')} <small style="font-size:0.8rem;color:#94A3B8">USD</small></div>
            <div class="admin-kpi-breakdown">
              <span>Average: <b>$${totalVehicles ? Math.round(totalValuation / totalVehicles).toLocaleString('en-US') : 0}</b> USD</span>
            </div>
          </div>
        `;
      }

      // Update sidebar counts
      const vCountEl = document.getElementById('sidebarVehicleCount');
      if (vCountEl) vCountEl.textContent = totalVehicles;

      const swCountEl = document.getElementById('sidebarSportswearCount');
      if (swCountEl) swCountEl.textContent = totalSW;

      // Render Recent Activity (combining vehicles & sportswear, sorted by updatedAt/createdAt)
      if (activityTable) {
        const combined = [
          ...vehicles.map(v => ({ ...v, itemType: 'Vehicle' })),
          ...sportswear.map(s => ({ ...s, itemType: 'Sportswear' }))
        ].sort((a, b) => new Date(b.updatedAt || b.createdAt || 0) - new Date(a.updatedAt || a.createdAt || 0)).slice(0, 8);

        if (!combined.length) {
          activityTable.innerHTML = `<tr><td colspan="5" style="text-align:center;color:#94A3B8;padding:24px">No recent inventory activity recorded yet.</td></tr>`;
          return;
        }

        activityTable.innerHTML = combined.map(item => {
          const dateStr = item.updatedAt ? new Date(item.updatedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Initial Seed';
          const badgeClass = item.status === 'Available' ? 'admin-badge-available' : item.status === 'Reserved' ? 'admin-badge-reserved' : 'admin-badge-sold';

          return `
            <tr>
              <td class="admin-thumb-cell">
                <img src="${item.image || 'images/logo.jpeg'}" class="admin-table-thumb" alt="${item.name}">
                <div>
                  <div class="admin-item-title">${item.name}</div>
                  <div class="admin-item-subtitle">${item.itemType} • ID ${item.id}</div>
                </div>
              </td>
              <td><span class="admin-price-badge"><small>$</small>${Number(item.price || 0).toLocaleString('en-US')} USD</span></td>
              <td><span class="admin-badge ${badgeClass}"><span class="admin-badge-dot"></span>${item.status}</span></td>
              <td style="color:#94A3B8;font-size:0.82rem">${dateStr}</td>
              <td style="text-align:right">
                <button type="button" class="admin-action-btn btn-edit" onclick="adminApp.editItem('${item.itemType}', '${item.id}')">
                  <span>View</span>
                </button>
              </td>
            </tr>
          `;
        }).join('');
      }
    }
  };

  window.adminDashboard = AdminDashboard;
})(window);
