/**
 * P4C Global App - Global application logic and initialization
 */

// Create P4C namespace if it doesn't exist
if (typeof P4C === 'undefined') {
  window.P4C = {};
}
if (!P4C.App) {
  P4C.App = {};
}

/**
 * Initialize global app functionality
 */
P4C.App.init = function() {
  this.setupGlobalEventHandlers();
  this.setupPerformanceMonitoring();
  this.setupAccessibilityFeatures();
  console.log('✅ P4C Global App initialized');
};

/**
 * Setup global event handlers
 */
P4C.App.setupGlobalEventHandlers = function() {
  // Global escape handler for all modals/dropdowns
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      this.closeAllOverlays();
    }
  });

  // Global click outside handler
  document.addEventListener('click', (e) => {
    // Close dropdowns/menus when clicking elsewhere
    this.handleGlobalClick(e);
  });
};

/**
 * Close all open overlays/menus
 */
P4C.App.closeAllOverlays = function() {
  // Close mobile menu
  const mobileMenu = document.getElementById('mobile-menu');
  if (mobileMenu) {
    mobileMenu.style.maxHeight = '0px';
    const toggle = document.getElementById('mobile-menu-toggle');
    if (toggle) toggle.setAttribute('aria-expanded', 'false');
  }

  // Close search
  const searchContainer = document.querySelector('.search-container');
  if (searchContainer) {
    searchContainer.classList.remove('active');
  }

  // Close banner (if exists)
  const installBanner = document.getElementById('install-banner');
  if (installBanner && installBanner.classList.contains('show')) {
    installBanner.classList.remove('show');
  }
};

/**
 * Handle global click events
 */
P4C.App.handleGlobalClick = function(event) {
  // Close search when clicking outside
  const searchContainer = document.querySelector('.search-container');
  if (searchContainer && !event.target.closest('.search-container') && !event.target.closest('[data-toggle="search"]')) {
    searchContainer.classList.remove('active');
  }
};

/**
 * Setup performance monitoring
 */
P4C.App.setupPerformanceMonitoring = function() {
  // Track largest contentful paint
  if ('PerformanceObserver' in window) {
    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'largest-contentful-paint') {
            console.log(`LCP: ${entry.startTime}ms`);
            // Could send to analytics
          }
        }
      });
      observer.observe({ entryTypes: ['largest-contentful-paint'] });
    } catch (e) {
      console.warn('LCP observer not supported');
    }
  }
};

/**
 * Setup accessibility features
 */
P4C.App.setupAccessibilityFeatures = function() {
  // Add smooth scrolling to anchor links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const href = anchor.getAttribute('href');
      if (href.length > 1) { // Not just "#"
        const target = document.querySelector(href);
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: 'smooth' });
          // Focus on target for accessibility
          target.setAttribute('tabindex', '-1');
          target.focus();
        }
      }
    });
  });

  // Improve focus visibility
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') {
      document.body.classList.add('keyboard-navigation');
    }
  });

  document.addEventListener('mousedown', () => {
    document.body.classList.remove('keyboard-navigation');
  });
};

/**
 * Check if running in development mode
 */
P4C.App.isDev = function() {
  return location.hostname === 'localhost' || location.hostname === '127.0.0.1';
};

/**
 * Debug logging (only in dev)
 */
P4C.App.debug = function(...args) {
  if (this.isDev()) {
    console.log('[P4C DEBUG]', ...args);
  }
};

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
  P4C.App.init();
});

// Export for global access
window.P4C = window.P4C || {};
window.P4C.App = P4C.App;
