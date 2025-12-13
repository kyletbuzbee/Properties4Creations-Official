/**
 * P4C Revenue Dashboard - Business Metrics Tracker
 * Simple dashboard for tracking business performance
 */

(function() {
  'use strict';

  // Revenue Dashboard Component
  const RevenueDashboard = {
    metrics: [],

    /**
     * Initialize dashboard
     */
    init: function() {
      this.loadData();
      this.renderDashboard();
    },

    /**
     * Load business metrics from localStorage
     */
    loadData: function() {
      try {
        const stored = localStorage.getItem('p4c_business_metrics');
        this.metrics = stored ? JSON.parse(stored) : [];

        // Filter to last 30 days only
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        this.metrics = this.metrics.filter(m => new Date(m.timestamp) > thirtyDaysAgo);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
        this.metrics = [];
      }
    },

    /**
     * Save metrics to localStorage
     */
    saveData: function() {
      try {
        localStorage.setItem('p4c_business_metrics', JSON.stringify(this.metrics));
      } catch (error) {
        console.error('Error saving dashboard data:', error);
      }
    },

    /**
     * Add new metric
     */
    addMetric: function(type, value, currency = 'USD') {
      const metric = {
        id: Date.now().toString(),
        type: type,
        value: parseFloat(value),
        currency: currency,
        timestamp: new Date().toISOString()
      };

      this.metrics.push(metric);
      this.saveData();
      this.updateSummary();
    },

    /**
     * Render dashboard
     */
    renderDashboard: function() {
      // Create dashboard container if it doesn't exist
      let dashboard = document.getElementById('p4c-revenue-dashboard');
      if (!dashboard) {
        dashboard = document.createElement('div');
        dashboard.id = 'p4c-revenue-dashboard';
        dashboard.className = 'p-6 bg-white rounded-xl shadow-lg max-w-4xl mx-auto mt-8';

        // Insert after main content or at end of body
        const main = document.querySelector('main');
        if (main) {
          main.appendChild(dashboard);
        } else {
          document.body.appendChild(dashboard);
        }
      }

      dashboard.innerHTML = `
        <div class="text-center mb-6">
          <h2 class="text-2xl font-bold text-brand-navy mb-2">Business Revenue Dashboard</h2>
          <p class="text-slate-600">Last 30 days performance tracking</p>
        </div>

        ${this.renderSummary()}

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          ${this.renderLeadTracking()}
          ${this.renderPropertyTracking()}
        </div>

        ${this.renderRecentActivity()}
      `;
    },

    /**
     * Render summary cards
     */
    renderSummary: function() {
      const totalRevenue = this.metrics
        .filter(m => m.type === 'lead_revenue' || m.type === 'property_view_revenue')
        .reduce((sum, m) => sum + m.value, 0);

      const totalLeads = this.metrics
        .filter(m => m.type === 'lead_submitted')
        .length;

      const veteranLeads = this.metrics
        .filter(m => m.type === 'lead_submitted' && m.extra?.isVeteran)
        .length;

      const conversionRate = totalLeads > 0 ?
        ((this.metrics.filter(m => m.type === 'property_lease_signed').length / totalLeads) * 100).toFixed(1) : 0;

      return `
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div class="bg-green-50 p-4 rounded-lg text-center">
            <div class="text-2xl font-bold text-green-600">$${totalRevenue.toLocaleString()}</div>
            <div class="text-sm text-green-700 font-medium">Monthly Revenue</div>
          </div>
          <div class="bg-blue-50 p-4 rounded-lg text-center">
            <div class="text-2xl font-bold text-blue-600">${totalLeads}</div>
            <div class="text-sm text-blue-700 font-medium">Total Leads</div>
          </div>
          <div class="bg-amber-50 p-4 rounded-lg text-center">
            <div class="text-2xl font-bold text-amber-600">${veteranLeads}</div>
            <div class="text-sm text-amber-700 font-medium">Veteran Leads</div>
          </div>
          <div class="bg-purple-50 p-4 rounded-lg text-center">
            <div class="text-2xl font-bold text-purple-600">${conversionRate}%</div>
            <div class="text-sm text-purple-700 font-medium">Conversion Rate</div>
          </div>
        </div>
      `;
    },

    /**
     * Render lead tracking chart
     */
    renderLeadTracking: function() {
      const last7Days = this.getLastDaysData(7);

      return `
        <div class="bg-slate-50 p-4 rounded-lg">
          <h3 class="font-bold text-brand-navy mb-3">Lead Generation (7 days)</h3>
          <div class="text-xs text-slate-600 mb-3">Business Model: 65% Families, 25% Veterans, 10% General</div>
          <div class="space-y-2">
            ${last7Days.map(day => `
              <div class="flex justify-between items-center text-sm">
                <span>${day.date}</span>
                <div class="flex gap-4">
                  <span class="text-green-600">${day.family} families</span>
                  <span class="text-blue-600">${day.veteran} veterans</span>
                  <span class="text-amber-600">${day.general} general</span>
                  <span class="font-bold">${day.total}</span>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    },

    /**
     * Render property tracking
     */
    renderPropertyTracking: function() {
      const propertyViews = {};
      this.metrics.filter(m => m.type === 'property_view').forEach(m => {
        propertyViews[m.extra?.property || 'Unknown'] =
          (propertyViews[m.extra?.property || 'Unknown'] || 0) + 1;
      });

      return `
        <div class="bg-slate-50 p-4 rounded-lg">
          <h3 class="font-bold text-brand-navy mb-3">Property Views</h3>
          <div class="space-y-2">
            ${Object.entries(propertyViews).slice(0, 5).map(([property, views]) => `
              <div class="flex justify-between items-center text-sm">
                <span class="truncate">${property}</span>
                <span class="font-bold bg-blue-100 px-2 py-1 rounded">${views}</span>
              </div>
            `).join('') || '<div class="text-slate-500 text-sm italic">No property views recorded</div>'}
          </div>
        </div>
      `;
    },

    /**
     * Render recent activity
     */
    renderRecentActivity: function() {
      const recent = this.metrics
        .filter(m => ['lead_submitted', 'property_view'].includes(m.type))
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        .slice(0, 5);

      return `
        <div class="mt-6">
          <h3 class="font-bold text-brand-navy mb-3">Recent Activity</h3>
          <div class="space-y-2">
            ${recent.map(m => `
              <div class="flex justify-between items-center py-2 border-b border-slate-100 last:border-b-0">
                <div>
                  <span class="font-medium">
                    ${m.type === 'lead_submitted' ? 'New Lead' : 'Property View'}
                  </span>
                  ${m.extra?.property ? `<span class="text-sm text-slate-600"> - ${m.extra.property}</span>` : ''}
                  ${m.extra?.isVeteran ? '<span class="ml-2 px-2 py-1 bg-amber-100 text-amber-800 text-xs rounded">Veteran</span>' : ''}
                </div>
                <span class="text-sm text-slate-500">${new Date(m.timestamp).toLocaleDateString()}</span>
              </div>
            `).join('') || '<div class="text-slate-500 text-sm italic">No recent activity</div>'}
          </div>
        </div>
      `;
    },

    /**
     * Get last N days data for leads - Veterans & Families
     */
    getLastDaysData: function(days) {
      const result = [];
      for (let i = days - 1; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

        const dayLeads = this.metrics.filter(m => {
          return m.type === 'lead_submitted' &&
                 new Date(m.timestamp).toDateString() === date.toDateString();
        });

        // Categorize leads: Families (primary), Veterans, General
        const veteran = dayLeads.filter(m => m.extra?.applicantType === 'veteran').length;
        const family = dayLeads.filter(m => m.extra?.applicantType === 'family').length;
        const general = dayLeads.filter(m => m.extra?.applicantType === 'general').length;

        result.push({
          date: dateStr,
          total: dayLeads.length,
          family: family,
          veteran: veteran,
          general: general
        });
      }
      return result;
    },

    /**
     * Update summary only (for real-time updates)
     */
    updateSummary: function() {
      const summaryElement = document.querySelector('#p4c-revenue-dashboard .grid.grid-cols-2.md\\:grid-cols-4');
      if (summaryElement) {
        summaryElement.outerHTML = this.renderSummary().match(/<div class="grid[^>]*>[\s\S]*?<\/div>/)[0];
      }
    }
  };

  // Make globally available
  window.P4CRevenueDashboard = RevenueDashboard;

  // Initialize if dashboard element exists
  if (document.getElementById('p4c-revenue-dashboard')) {
    RevenueDashboard.init();
  }

  // Add method for external integration
  if (window.P4CAnalytics) {
    const originalTrackLeadGen = window.P4CAnalytics.trackLeadGeneration;
    window.P4CAnalytics.trackLeadGeneration = function(formType, propertyId, applicantType, leadValue) {
      // Call original
      originalTrackLeadGen.call(this, formType, propertyId, applicantType, leadValue);

      // Track in dashboard with proper applicant type
      RevenueDashboard.addMetric('lead_revenue', leadValue);
      RevenueDashboard.addMetric('lead_submitted', 1, undefined, { propertyId, applicantType: applicantType });
    };
  }

})();
