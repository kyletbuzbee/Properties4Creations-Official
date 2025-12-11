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
            // Could send to analytics
          }
        }
      });
      observer.observe({ entryTypes: ['largest-contentful-paint'] });
    } catch (e) {
      // LCP observer not supported in this browser
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
 * Initialize map only when needed
 */
P4C.App.initMap = function() {
  const mapContainer = document.getElementById('map-container');
  if (!mapContainer) {
    console.log('No map container found - skipping map initialization');
    return Promise.resolve();
  }

  console.log('Initializing map...');

  return new Promise((resolve, reject) => {
    // Check if Leaflet is already loaded
    if (typeof L !== 'undefined') {
      this.renderMap().then(resolve).catch(reject);
      return;
    }

    // Load Leaflet CSS
    const cssLink = document.createElement('link');
    cssLink.rel = 'stylesheet';
    cssLink.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    cssLink.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=';
    cssLink.crossOrigin = '';
    document.head.appendChild(cssLink);

    // Load Leaflet JS
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.integrity = 'sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=';
    script.crossOrigin = '';

    script.onload = () => {
      console.log('Leaflet loaded successfully');
      this.renderMap().then(resolve).catch(reject);
    };

    script.onerror = () => {
      console.error('Failed to load Leaflet');
      this.showMapFallback();
      reject(new Error('Failed to load Leaflet'));
    };

    document.head.appendChild(script);
  });
};

/**
 * Render the actual map functionality
 */
P4C.App.renderMap = function() {
  return new Promise(async (resolve, reject) => {
    try {
      const mapContainer = document.getElementById('map-container');
      const loadingState = document.getElementById('map-loading');
      const errorState = document.getElementById('map-error');
      const mapElement = document.getElementById('home-map');

      // Hide loading and error states
      if (loadingState) loadingState.classList.add('hidden');
      if (errorState) errorState.classList.add('hidden');

      // Initialize map centered on Tyler, TX
      const map = L.map('home-map').setView([32.3513, -95.3011], 9);

      // Add tile layer (CartoDB Voyager for clean look)
      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 19
      }).addTo(map);

      // Custom house icon - uses PNG for map markers
      // HEROICONS UPGRADE: Consider using Heroicons for map markers
      const houseIcon = L.icon({
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32]
      });

      // Fetch and plot property data
      const response = await fetch('public/properties-data.json');
      if (!response.ok) {
        throw new Error(`Failed to load property data: ${response.status}`);
      }

      const data = await response.json();

      // Add markers for each property
      data.forEach(prop => {
        if (prop.lat && prop.lng) {
          L.marker([prop.lat, prop.lng], { icon: houseIcon })
            .addTo(map)
            .bindPopup(`
              <div class="text-center p-2">
                <strong class="text-brand-navy block mb-1">${prop.title || 'Available Property'}</strong>
                <span class="text-green-600 font-bold text-sm">${prop.price || 'Contact for pricing'}</span><br>
                <a href="${prop.url || '#'}" class="text-brand-wood text-xs underline mt-2 block hover:text-brand-navy">
                  ${prop.url ? 'View Details' : 'Coming Soon'}
                </a>
              </div>
            `);
        }
      });

      // Ensure map is properly sized
      setTimeout(() => {
        map.invalidateSize();
      }, 100);

      resolve(map);

    } catch (error) {
      console.error('Error rendering map:', error);
      this.showMapFallback();
      reject(error);
    }
  });
};

/**
 * Show map fallback when loading fails
 */
P4C.App.showMapFallback = function() {
  const mapContainer = document.getElementById('map-container');
  const errorState = document.getElementById('map-error');
  const loadingState = document.getElementById('map-loading');

  // Hide loading state
  if (loadingState) loadingState.classList.add('hidden');

  // Show error state
  if (errorState) errorState.classList.remove('hidden');
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
