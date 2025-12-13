/**
 * Properties 4 Creations - Main Application JavaScript
 */

const P4C = window.P4C || {};

P4C.App = {
  /**
   * Initialize application
   */
  init: function () {
    console.log('🏠 Properties 4 Creations - Application Initialized');

    // Initialize mobile menu if component loader hasn't
    this.initMobileMenu();

    // Initialize map if on home page
    if (document.getElementById('map-container')) {
      this.initMap();
    }

    // Update copyright year
    this.updateCopyrightYear();
  },

  /**
   * Initialize mobile menu toggle
   */
  initMobileMenu: function () {
    const menuToggle = document.getElementById('mobile-menu-toggle');
    const mobileMenu = document.getElementById('mobile-menu');

    if (menuToggle && mobileMenu) {
      menuToggle.addEventListener('click', function (e) {
        e.stopPropagation();
        mobileMenu.classList.toggle('open');
        const isOpen = mobileMenu.classList.contains('open');
        menuToggle.setAttribute('aria-expanded', isOpen);
      });

      // Close when clicking outside
      document.addEventListener('click', function (e) {
        if (!mobileMenu.contains(e.target) && !menuToggle.contains(e.target)) {
          mobileMenu.classList.remove('open');
          menuToggle.setAttribute('aria-expanded', 'false');
        }
      });

      // Close when clicking a link
      const mobileLinks = mobileMenu.querySelectorAll('a');
      mobileLinks.forEach((link) => {
        link.addEventListener('click', function () {
          mobileMenu.classList.remove('open');
          menuToggle.setAttribute('aria-expanded', 'false');
        });
      });
    }
  },

  /**
   * Initialize Leaflet map for East Texas footprint
   */
  initMap: function () {
    const mapContainer = document.getElementById('map-container');
    if (mapContainer && typeof L !== 'undefined') {
      // Clear existing content
      mapContainer.innerHTML = '';

      // Initialize Leaflet map
      const map = L.map('map-container', {
        center: [32.3, -95.3], // Center of East Texas area
        zoom: 9,
        zoomControl: true,
        scrollWheelZoom: false,
        attributionControl: true,
      });

      // Add accessibility attributes to map container
      const mapElement = document.getElementById('map-container');
      mapElement.setAttribute(
        'aria-label',
        'Interactive map showing Properties 4 Creations service areas in East Texas',
      );
      mapElement.setAttribute('role', 'img');

      // Add OpenStreetMap tiles (free and reliable)
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 18,
      }).addTo(map);

      // Custom marker icons using SVG
      const createCustomIcon = (color) => {
        return L.divIcon({
          html: `<div style="background-color: ${color}; width: 32px; height: 32px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; font-size: 16px;">📍</div>`,
          className: 'custom-marker',
          iconSize: [32, 32],
          iconAnchor: [16, 32],
          popupAnchor: [0, -32],
        });
      };

      // Add Tyler marker
      const tylerMarker = L.marker([32.3513, -95.3011], {
        icon: createCustomIcon('#C28E5A'), // Wood color
      }).addTo(map);

      tylerMarker.bindPopup(
        `
                <div style="text-align: center; font-family: 'Inter', sans-serif;">
                    <h3 style="margin: 0 0 5px 0; color: #0B1120; font-weight: 700;">Tyler, TX</h3>
                    <p style="margin: 0; font-size: 14px; color: #64748b;">Properties 4 Creations Service Area</p>
                    <p style="margin: 5px 0 0 0; font-size: 13px;">Serving veteran & family housing needs</p>
                </div>
            `,
        {
          maxWidth: 250,
          closeButton: false,
        },
      );

      // Add Longview marker
      const longviewMarker = L.marker([32.5007, -94.7405], {
        icon: createCustomIcon('#0B1120'), // Navy color
      }).addTo(map);

      longviewMarker.bindPopup(
        `
                <div style="text-align: center; font-family: 'Inter', sans-serif;">
                    <h3 style="margin: 0 0 5px 0; color: #0B1120; font-weight: 700;">Longview, TX</h3>
                    <p style="margin: 0; font-size: 14px; color: #64748b;">Properties 4 Creations Service Area</p>
                    <p style="margin: 5px 0 0 0; font-size: 13px;">Premium renovations & Section 8 support</p>
                </div>
            `,
        {
          maxWidth: 250,
          closeButton: false,
        },
      );

      // Add legend
      const legend = L.control({ position: 'bottomleft' });
      legend.onAdd = function (map) {
        const div = L.DomUtil.create('div', 'map-legend');
        div.innerHTML = `
                    <div style="background: white; padding: 10px 15px; border-radius: 8px; box-shadow: 0 2px 5px rgba(0,0,0,0.2); font-size: 12px; font-family: 'Inter', sans-serif;">
                        <p style="margin: 0 0 8px 0; font-weight: 600; color: #0B1120;">Our Service Areas</p>
                        <div style="display: flex; align-items: center; gap: 10px;">
                            <div style="display: flex; align-items: center; gap: 4px;">
                                <div style="width: 10px; height: 10px; background: #C28E5A; border-radius: 50%;"></div>
                                <span>Tyler</span>
                            </div>
                            <div style="display: flex; align-items: center; gap: 4px;">
                                <div style="width: 10px; height: 10px; background: #0B1120; border-radius: 50%;"></div>
                                <span>Longview</span>
                            </div>
                        </div>
                    </div>
                `;
        return div;
      };
      legend.addTo(map);

      // Fit map to show both markers with padding
      const group = new L.featureGroup([tylerMarker, longviewMarker]);
      map.fitBounds(group.getBounds().pad(0.2));

      // Open both popups on desktop
      if (window.innerWidth >= 768) {
        setTimeout(() => {
          tylerMarker.openPopup();
          setTimeout(() => longviewMarker.openPopup(), 500);
        }, 1500);
      }

      console.log('🗺️ Interactive Leaflet map loaded');
    } else if (mapContainer) {
      // Fallback to static map if Leaflet isn't loaded
      mapContainer.innerHTML = `
                <div class="w-full h-full relative bg-slate-100 rounded-xl overflow-hidden flex items-center justify-center">
                    <div class="text-center p-8">
                        <div class="w-16 h-16 bg-brand-wood rounded-full flex items-center justify-center mx-auto mb-4">
                            <i class="text-white text-2xl">🗺️</i>
                        </div>
                        <h3 class="text-lg font-bold text-brand-navy mb-2">Interactive Map Not Available</h3>
                        <p class="text-slate-600">We're serving East Texas from Tyler to Longview.</p>
                        <p class="text-sm text-slate-500 mt-2">📍 Properties 4 Creations Service Areas</p>
                    </div>
                </div>
            `;
      console.log('📍 Static map fallback loaded (Leaflet not available)');
    }
  },

  /**
   * Update copyright year
   */
  updateCopyrightYear: function () {
    const yearElement = document.getElementById('current-year');
    if (yearElement) {
      yearElement.textContent = new Date().getFullYear();
    }
  },
};

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => P4C.App.init());
} else {
  P4C.App.init();
}

window.P4C = P4C;
