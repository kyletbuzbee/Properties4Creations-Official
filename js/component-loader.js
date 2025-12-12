/**
 * Component Loader Module
 * Handles dynamic loading of header, footer, and page banners
 */

const P4C = window.P4C || {};

P4C.ComponentLoader = {
    /**
     * Initialize component loader
     */
    init: function() {
        // Load header if it doesn't exist
        if (!document.getElementById('main-header')) {
            this.loadHeader();
        }

        // Load footer if it doesn't exist
        if (!document.querySelector('footer')) {
            this.loadFooter();
        }

        // Load page banner if placeholder exists
        if (document.getElementById('page-banner-placeholder')) {
            this.loadPageBanner();
        }
    },

    /**
     * Load header component
     */
    loadHeader: async function() {
        try {
            const response = await fetch('components/header.html');
            
            if (!response.ok) {
                throw new Error(`Failed to load header: ${response.status}`);
            }
            
            const headerHTML = await response.text();
            const headerContainer = document.getElementById('header-container');
            const existingHeader = document.getElementById('main-header');
            
            if (headerContainer) {
                headerContainer.innerHTML = headerHTML;
            } else if (existingHeader) {
                existingHeader.outerHTML = headerHTML;
            } else {
                document.body.insertAdjacentHTML('afterbegin', headerHTML);
            }
            
            // Initialize header interactivity
            this.initHeaderInteractivity();
            
            // Apply navigation highlighting
            this.applyNavigationHighlighting();
            
            console.log('✅ Header loaded');
            
        } catch (error) {
            console.error('❌ Error loading header:', error);
        }
    },

    /**
     * Load footer component
     */
    loadFooter: async function() {
        try {
            const response = await fetch('components/footer.html');
            
            if (!response.ok) {
                throw new Error(`Failed to load footer: ${response.status}`);
            }
            
            const footerHTML = await response.text();
            const footerContainer = document.getElementById('footer-container');
            
            if (footerContainer) {
                footerContainer.innerHTML = footerHTML;
            } else {
                document.body.insertAdjacentHTML('beforeend', footerHTML);
            }
            
            console.log('✅ Footer loaded');
            
        } catch (error) {
            console.error('❌ Error loading footer:', error);
        }
    },

    /**
     * Load page banner component
     */
    loadPageBanner: async function() {
        try {
            const response = await fetch('components/page-banner.html');
            
            if (!response.ok) {
                throw new Error(`Failed to load banner: ${response.status}`);
            }
            
            const bannerHTML = await response.text();
            const bannerPlaceholder = document.getElementById('page-banner-placeholder');
            
            if (bannerPlaceholder) {
                bannerPlaceholder.innerHTML = bannerHTML;
            }
            
            console.log('✅ Banner loaded');
            
        } catch (error) {
            console.error('❌ Error loading banner:', error);
        }
    },

    /**
     * Initialize header interactivity (mobile menu toggle)
     */
    initHeaderInteractivity: function() {
        const menuToggle = document.getElementById('mobile-menu-toggle');
        const mobileMenu = document.getElementById('mobile-menu');
        
        if (menuToggle && mobileMenu) {
            menuToggle.addEventListener('click', function(e) {
                e.stopPropagation();
                const isOpen = mobileMenu.classList.contains('open');
                
                if (isOpen) {
                    mobileMenu.classList.remove('open');
                    menuToggle.setAttribute('aria-expanded', 'false');
                } else {
                    mobileMenu.classList.add('open');
                    menuToggle.setAttribute('aria-expanded', 'true');
                }
            });
            
            // Close mobile menu when clicking outside
            document.addEventListener('click', function(e) {
                if (!mobileMenu.contains(e.target) && !menuToggle.contains(e.target)) {
                    mobileMenu.classList.remove('open');
                    menuToggle.setAttribute('aria-expanded', 'false');
                }
            });
        }
    },

    /**
     * Apply navigation highlighting based on current page
     */
    applyNavigationHighlighting: function() {
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';
        const navLinks = document.querySelectorAll('nav a');
        
        navLinks.forEach(link => {
            const linkPage = link.getAttribute('href');
            if (linkPage === currentPage) {
                link.classList.add('bg-white/20', 'rounded-lg');
            }
        });
    }
};

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => P4C.ComponentLoader.init());
} else {
    P4C.ComponentLoader.init();
}

window.P4C = P4C;
