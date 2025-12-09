/**
 * P4C Component Loader
 * Dynamically loads header and footer components into pages
 */

// Create P4C namespace if it doesn't exist
if (typeof P4C === 'undefined') {
  window.P4C = {};
}

/**
 * ComponentLoader - Manages dynamic component loading
 * @namespace P4C.ComponentLoader
 */
P4C.ComponentLoader = {
  /**
   * Initialize component loader
   * Loads header and footer components only if no existing elements present
   * @function init
   */
  init: function() {
    console.log('🔄 Loading P4C Components...');
    // Only load components if no existing elements are found
    if (!document.getElementById('main-header')) {
      this.loadHeader();
    }
    if (!document.querySelector('footer')) {
      this.loadFooter();
    }
    console.log('✅ P4C Components loaded (preserving existing)');
  },

  /**
   * Load header component dynamically
   * Fetches header.html and replaces existing header
   * @async
   * @function loadHeader
   */
  loadHeader: async function() {
    try {
      const existingHeader = document.getElementById('main-header');

      const response = await fetch('/components/header.html');
      if (!response.ok) {
        throw new Error(`Failed to load header: ${response.status}`);
      }

      const headerHTML = await response.text();

      if (existingHeader) {
        // Replace the existing header element
        existingHeader.outerHTML = headerHTML;
      } else {
        // Fallback: insert at beginning of body
        document.body.insertAdjacentHTML('afterbegin', headerHTML);
      }

      // Reinitialize header interactivity
      this.reinitializeHeaderInteractivity();

      // Apply navigation highlighting based on current page
      this.applyNavigationHighlighting();
    } catch (error) {
      console.error('Error loading header component:', error);
    }
  },

  /**
   * Load footer component dynamically
   * Fetches footer.html and replaces existing footer
   * Updates copyright year to current year
   * @async
   * @function loadFooter
   */
  loadFooter: async function() {
    try {
      const existingFooter = document.querySelector('footer');

      const response = await fetch('/components/footer.html');
      if (!response.ok) {
        throw new Error(`Failed to load footer: ${response.status}`);
      }

      const footerHTML = await response.text();

      if (existingFooter) {
        // Replace the existing footer element
        existingFooter.outerHTML = footerHTML;
      } else {
        // Fallback: insert at end of body
        document.body.insertAdjacentHTML('beforeend', footerHTML);
      }

      // Update copyright year
      const currentYearElement = document.getElementById('current-year');
      if (currentYearElement) {
        currentYearElement.textContent = new Date().getFullYear();
      }
    } catch (error) {
      console.error('Error loading footer component:', error);
    }
  },

  /**
   * Reinitialize header interactivity for dynamically loaded content
   * UPDATED: Now includes Dark Mode toggle logic
   * @function reinitializeHeaderInteractivity
   */
  reinitializeHeaderInteractivity: function() {
    // 1. Mobile menu toggle
    const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
    const mobileMenu = document.getElementById('mobile-menu');

    if (mobileMenuToggle && mobileMenu) {
      mobileMenuToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        this.toggleMobileMenu();
      });
      // Close mobile menu when clicking outside
      document.addEventListener('click', (e) => {
        if (!mobileMenu.contains(e.target) && !mobileMenuToggle.contains(e.target)) {
          this.closeMobileMenu();
        }
      });
    }

    // 2. DARK MODE TOGGLE LOGIC (New)
    const themeToggle = document.getElementById('theme-toggle');
    const sunIcon = document.getElementById('theme-sun');
    const moonIcon = document.getElementById('theme-moon');
    const htmlEl = document.documentElement;

    // Check saved preference on load
    if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        htmlEl.classList.add('dark');
        if(sunIcon && moonIcon) {
            sunIcon.classList.add('hidden');
            moonIcon.classList.remove('hidden');
        }
    } else {
        htmlEl.classList.remove('dark');
        if(sunIcon && moonIcon) {
            sunIcon.classList.remove('hidden');
            moonIcon.classList.add('hidden');
        }
    }

    // Handle Click
    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            htmlEl.classList.toggle('dark');

            // Toggle Icons
            if(sunIcon && moonIcon) {
                sunIcon.classList.toggle('hidden');
                moonIcon.classList.toggle('hidden');
            }

            // Save Preference
            if (htmlEl.classList.contains('dark')) {
                localStorage.theme = 'dark';
            } else {
                localStorage.theme = 'light';
            }
        });
    }

    // 3. Existing Portal/Search logic (Preserved)
    const portalButton = document.querySelector('[data-toggle="portal"]');
    const portalMenu = document.querySelector('.portal-menu');
    if (portalButton && portalMenu) {
      portalButton.addEventListener('click', (e) => {
        e.stopPropagation();
        portalMenu.classList.toggle('active');
      });
      document.addEventListener('click', (e) => {
        if (!portalMenu.contains(e.target) && !portalButton.contains(e.target)) {
          portalMenu.classList.remove('active');
        }
      });
    }
  },

  /**
   * Toggle mobile menu visibility
   * Handles smooth animation and ARIA state
   * @function toggleMobileMenu
   */
  toggleMobileMenu: function() {
    const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
    const mobileMenu = document.getElementById('mobile-menu');

    if (!mobileMenu || !mobileMenuToggle) return;

    const isExpanded = mobileMenuToggle.getAttribute('aria-expanded') === 'true';
    const newState = !isExpanded;

    // Update ARIA state
    mobileMenuToggle.setAttribute('aria-expanded', newState ? 'true' : 'false');

    // Toggle menu visibility with smooth animation
    if (newState) {
      mobileMenu.style.maxHeight = '0px'; // Start collapsed
      mobileMenu.offsetHeight; // Force reflow
      mobileMenu.style.maxHeight = '500px'; // Expand
    } else {
      mobileMenu.style.maxHeight = '0px'; // Collapse
    }
  },

  /**
   * Close mobile menu
   * @function closeMobileMenu
   */
  closeMobileMenu: function() {
    const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
    const mobileMenu = document.getElementById('mobile-menu');

    if (mobileMenuToggle) {
      mobileMenuToggle.setAttribute('aria-expanded', 'false');
    }
    if (mobileMenu) {
      mobileMenu.style.maxHeight = '0px';
    }
  },

  /**
   * Apply smart navigation highlighting based on current page
   * Uses robust path normalization for reliable highlighting
   * @function applyNavigationHighlighting
   */
  applyNavigationHighlighting: function() {
    // Robust Navigation Highlighting
    const normalizePath = (path) => {
        if (!path) return '';
        return path.replace(/^(?:https?:\/\/[^\/]+)?/, '') // Remove domain
                   .replace(/\/$/, '')                      // Remove trailing slash
                   .replace(/\/index\.html$/, '')           // Remove index.html
                   .replace(/\.html$/, '');                 // Remove .html extension
    };

    const currentPath = normalizePath(location.pathname);
    const navLinks = document.querySelectorAll('nav a[href], #mobile-menu a[href]');
    
    navLinks.forEach(link => {
        const linkPath = normalizePath(link.getAttribute('href'));
        // Highlight if paths match OR if current path is a sub-section of the link
        if (linkPath === currentPath || (linkPath !== '' && currentPath.startsWith(linkPath))) {
            link.classList.add('bg-white/20', 'font-bold', 'text-white');
        }
    });
  }
};

// Gallery Tab Switching Logic (Option B Implementation)
/**
 * Switch between renovation gallery tabs
 * @param {string} tabName - Name of tab to show ('deck', 'kitchen', 'living')
 */
window.switchTab = function(tabName) {
  // Reset all tabs
  document.querySelectorAll('[id^="tab-"]').forEach(tab => {
    tab.className = 'px-6 py-2 rounded-lg font-bold text-sm transition-all text-slate-600 hover:text-brand-navy hover:bg-white';
  });

  // Highlight active tab
  const activeTab = document.getElementById(`tab-${tabName}`);
  if(activeTab) {
    activeTab.className = 'px-6 py-2 rounded-lg font-bold text-sm transition-all bg-brand-wood text-white shadow-md';
  }

  // Hide all content
  document.querySelectorAll('.tab-content').forEach(content => {
    content.classList.remove('opacity-100', 'z-10');
    content.classList.add('opacity-0', 'z-0', 'pointer-events-none');
  });

  // Show active content
  const activeContent = document.getElementById(`content-${tabName}`);
  if(activeContent) {
    activeContent.classList.remove('opacity-0', 'z-0', 'pointer-events-none');
    activeContent.classList.add('opacity-100', 'z-10');
  }
};

/* Gallery Comparison Sliders Initialization */
document.addEventListener('DOMContentLoaded', () => {
  // Handle slider input events for comparison sliders
  document.body.addEventListener('input', (e) => {
    if (e.target.classList.contains('slider-control')) {
      const slider = e.target.closest('.comparison-slider');
      if (slider) {
        const val = e.target.value + '%';
        slider.querySelector('.overlay').style.width = val;
        slider.querySelector('.slider-handle').style.left = val;
      }
    }
  });
});

// Initialize PWA Service Worker registration
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/public/sw.js')
    .then(function(registration) {
      console.log('P4C Service Worker registered:', registration);
    })
    .catch(function(error) {
      console.log('P4C Service Worker registration failed:', error);
    });
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', function() {
    P4C.ComponentLoader.init();
  });
} else {
  P4C.ComponentLoader.init();
}

// Event dispatch for race condition fix
window.dispatchEvent(new Event('P4C:ComponentsReady'));
