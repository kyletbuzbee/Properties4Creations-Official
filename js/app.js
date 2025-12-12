/**
 * Properties 4 Creations - Main Application JavaScript
 */

const P4C = window.P4C || {};

P4C.App = {
    /**
     * Initialize application
     */
    init: function() {
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
    initMobileMenu: function() {
        const menuToggle = document.getElementById('mobile-menu-toggle');
        const mobileMenu = document.getElementById('mobile-menu');
        
        if (menuToggle && mobileMenu) {
            menuToggle.addEventListener('click', function(e) {
                e.stopPropagation();
                mobileMenu.classList.toggle('open');
                const isOpen = mobileMenu.classList.contains('open');
                menuToggle.setAttribute('aria-expanded', isOpen);
            });
            
            // Close when clicking outside
            document.addEventListener('click', function(e) {
                if (!mobileMenu.contains(e.target) && !menuToggle.contains(e.target)) {
                    mobileMenu.classList.remove('open');
                    menuToggle.setAttribute('aria-expanded', 'false');
                }
            });
            
            // Close when clicking a link
            const mobileLinks = mobileMenu.querySelectorAll('a');
            mobileLinks.forEach(link => {
                link.addEventListener('click', function() {
                    mobileMenu.classList.remove('open');
                    menuToggle.setAttribute('aria-expanded', 'false');
                });
            });
        }
    },

    /**
     * Initialize map (placeholder - replace with actual map implementation)
     */
    initMap: function() {
        const mapContainer = document.getElementById('map-container');
        if (mapContainer) {
            mapContainer.innerHTML = '<div class="flex items-center justify-center h-full bg-slate-100 rounded-xl"><p class="text-slate-500 text-lg">Map loading...</p></div>';
            console.log('📍 Map container initialized');
        }
    },

    /**
     * Update copyright year
     */
    updateCopyrightYear: function() {
        const yearElement = document.getElementById('current-year');
        if (yearElement) {
            yearElement.textContent = new Date().getFullYear();
        }
    }
};

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => P4C.App.init());
} else {
    P4C.App.init();
}

window.P4C = P4C;
