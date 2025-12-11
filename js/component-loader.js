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
    // Only load components if no existing elements are found
    if (!document.getElementById('main-header')) {
      this.loadHeader();
    }

    if (!document.querySelector('footer')) {
      this.loadFooter();
    }

    // Load page banner if placeholder exists
    if (document.getElementById('page-banner-placeholder')) {
      this.loadPageBanner();
    }
  },

  /**
   * Load header component dynamically
   * Fetches header.html and places it in header-container div
   * @async
   * @function loadHeader
   */
  loadHeader: async function() {
    try {
      const headerContainer = document.getElementById('header-container');
      if (!headerContainer) {
        console.warn('Header container not found');
        return;
      }

      const response = await fetch('components/header.html');

      if (!response.ok) {
        throw new Error(`Failed to load header: ${response.status}`);
      }

      const headerHTML = await response.text();
      headerContainer.innerHTML = headerHTML;

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
      const response = await fetch('components/footer.html');
      
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

      // Initialize footer functionality (moved from inline script)
      this.initializeFooterInteractivity();
    } catch (error) {
      console.error('Error loading footer component:', error);
    }
  },

  /**
   * Load page banner component dynamically
   * Fetches page-banner.html and replaces placeholder
   * @async
   * @function loadPageBanner
   */
  loadPageBanner: async function() {
    try {
      const placeholder = document.getElementById('page-banner-placeholder');
      if (!placeholder) return;

      const response = await fetch('components/page-banner.html');

      if (!response.ok) {
        throw new Error(`Failed to load banner: ${response.status}`);
      }

      const bannerHTML = await response.text();
      placeholder.outerHTML = bannerHTML;

      console.log('✅ Page banner loaded successfully');
    } catch (error) {
      console.error('Error loading page banner:', error);
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
    
    // 2. DARK MODE TOGGLE LOGIC
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
   * FIXED: Now respects header background color for proper contrast
   * @function applyNavigationHighlighting
   */
  applyNavigationHighlighting: function() {
    // Robust Navigation Highlighting
    const normalizePath = (path) => {
      if (!path) return '';
      return path.replace(/^(?:https?:\/\/[^\/]+)?/, '') // Remove domain
        .replace(/\/$/, '') // Remove trailing slash
        .replace(/\/index\.html$/, '') // Remove index.html
        .replace(/\.html$/, ''); // Remove .html extension
    };

    const currentPath = normalizePath(location.pathname);
    const navLinks = document.querySelectorAll('nav a[href], #mobile-menu a[href]');

    navLinks.forEach(link => {
      const linkPath = normalizePath(link.getAttribute('href'));

      // Remove old highlighting classes first
      link.classList.remove('bg-white/20', 'font-bold', 'text-white', 'bg-brand-wood', 'text-brand-navy', 'px-4', 'py-2', 'rounded-lg');

      // Highlight if paths match OR if current path is a sub-section of the link
      if (linkPath === currentPath || (linkPath !== '' && currentPath.startsWith(linkPath))) {
        // Check if header has dark background (glass-premium class)
        const header = document.getElementById('main-header');
        const isDarkHeader = header && header.classList.contains('glass-premium');

        if (isDarkHeader) {
          // Dark header: use white text with subtle background
          link.classList.add('bg-white/20', 'font-bold', 'text-white');
        } else {
          // Light header: use brand wood with white text for contrast
          link.classList.add('bg-brand-wood', 'font-bold', 'text-white', 'px-4', 'py-2', 'rounded-lg');
        }
      }
    });
  },

  /**
   * Initialize footer interactivity for dynamically loaded content
   * Moved from inline script to component loader for CORS compliance
   * @function initializeFooterInteractivity
   */
  initializeFooterInteractivity: function() {
    // Prevent duplicate initialization
    if (window.footerInit) return;
    window.footerInit = true;

    // Section 8 status indicator (mock live status)
    const statusIndicator = document.getElementById('section8-status-indicator');
    if (statusIndicator) {
      statusIndicator.classList.add('animate-pulse');
    }

    // Accessibility widget toggle
    const toggleBtn = document.getElementById('footer-accessibility-toggle');
    const overlay = document.getElementById('accessibility-overlay');
    const widget = document.getElementById('accessibility-widget');
    const closeBtn = document.getElementById('accessibility-close');
    const applyBtn = document.getElementById('accessibility-apply');

    if (toggleBtn && overlay && widget) {
      toggleBtn.addEventListener('click', () => {
        widget.classList.toggle('hidden');
        overlay.classList.toggle('hidden');
      });

      overlay.addEventListener('click', () => {
        widget.classList.add('hidden');
        overlay.classList.add('hidden');
      });

      if (closeBtn) closeBtn.addEventListener('click', () => {
        widget.classList.add('hidden');
        overlay.classList.add('hidden');
      });

      if (applyBtn) applyBtn.addEventListener('click', () => {
        const textSize = document.getElementById('text-size-select').value;
        const contrast = document.getElementById('contrast-select').value;
        const motion = document.getElementById('motion-select').value;

        // Apply safe inline styles (moved to proper CSS in future)
        document.documentElement.style.fontSize = textSize === 'large' ? '112%' : textSize === 'extra-large' ? '125%' : '100%';
        document.documentElement.classList.toggle('high-contrast', contrast === 'high');
        document.documentElement.style.scrollBehavior = motion === 'reduced' ? 'auto' : 'smooth';
        widget.classList.add('hidden');
        overlay.classList.add('hidden');
      });

      // Load PWA install banner
      fetch('components/install-banner.html')
        .then(response => {
          if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
          }
          return response.text();
        })
        .then(html => {
          const placeholder = document.getElementById('pwa-banner-placeholder');
          if (placeholder) {
            placeholder.outerHTML = html;
          }
        })
        .then(() => {
          // Dynamically load PWA install script
          const script = document.createElement('script');
          script.src = '/js/pwa-install.js';
          script.async = true;
          document.head.appendChild(script);
        })
        .catch(err => console.error('PWA install setup failed:', err));
    }
  }
};

// Gallery Tab Switching Logic
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

/* Gallery Comparison Sliders Initialization - FIXED */
document.addEventListener('DOMContentLoaded', () => {
  // Handle slider input events for comparison sliders
  document.body.addEventListener('input', (e) => {
    if (e.target.classList.contains('slider-control')) {
      // Find the closest container (robust selector)
      const container = e.target.closest('.relative') || e.target.closest('.comparison-slider');
      
      if (container) {
        const val = e.target.value;
        const overlay = container.querySelector('.overlay');
        const handle = container.querySelector('.slider-handle');
        
        // Update overlay width
        if (overlay) {
          overlay.style.width = val + '%';
        }
        
        // Update handle position
        if (handle) {
          handle.style.left = val + '%';
        }
      }
    }
  });
  
  // Initialize sliders to 50% on page load
  document.querySelectorAll('.slider-control').forEach(slider => {
    slider.value = 50;
    // Trigger initial update
    slider.dispatchEvent(new Event('input', { bubbles: true }));
  });
});

// Initialize PWA Service Worker registration (silently)
if ('serviceWorker' in navigator && !window.P4C_SERVICE_WORKER_REGISTERED) {
  navigator.serviceWorker.register('public/sw.js', { scope: '/' })
    .catch(function() {
      // Silently handle service worker registration errors
    });
  window.P4C_SERVICE_WORKER_REGISTERED = true;
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
