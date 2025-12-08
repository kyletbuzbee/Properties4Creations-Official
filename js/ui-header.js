/**
 * P4C UI Header - Interactive Header Components
 * Handles mobile menu, navigation highlighting, and search functionality
 */

// Initialize header interactions when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
  initializeHeaderInteractions();
});

/**
 * Initialize all header interactive features
 */
function initializeHeaderInteractions() {
  setupMobileMenu();
  setupSearchFunctionality();
  setupNavigationHighlighting();
}

/**
 * Setup mobile menu toggle and interaction
 */
function setupMobileMenu() {
  const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
  const mobileMenu = document.getElementById('mobile-menu');

  if (!mobileMenuToggle || !mobileMenu) return;

  // Mobile menu toggle - Use proper show/hide logic
  mobileMenuToggle.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleMobileMenu();
  });

  // Close mobile menu when clicking outside
  document.addEventListener('click', (e) => {
    if (!mobileMenu.contains(e.target) && !mobileMenuToggle.contains(e.target)) {
      closeMobileMenu();
    }
  });

  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeMobileMenu();
    }
  });
}

/**
 * Toggle mobile menu visibility with smooth animation
 */
function toggleMobileMenu() {
  const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
  const mobileMenu = document.getElementById('mobile-menu');

  if (!mobileMenuToggle || !mobileMenu) return;

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
    closeMobileMenu();
  }
}

/**
 * Close mobile menu
 */
function closeMobileMenu() {
  const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
  const mobileMenu = document.getElementById('mobile-menu');

  if (mobileMenuToggle) {
    mobileMenuToggle.setAttribute('aria-expanded', 'false');
  }
  if (mobileMenu) {
    mobileMenu.style.maxHeight = '0px';
  }
}

/**
 * Setup search functionality
 */
function setupSearchFunctionality() {
  const searchButton = document.querySelector('[data-toggle="search"]');
  const searchContainer = document.querySelector('.search-container');

  if (!searchButton || !searchContainer) return;

  searchButton.addEventListener('click', (e) => {
    e.stopPropagation();
    searchContainer.classList.toggle('active');
    const searchInput = searchContainer.querySelector('input');
    if (searchInput && searchContainer.classList.contains('active')) {
      searchInput.focus();
    }
  });

  // Close search when clicking outside
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.search-container') && !e.target.closest('[data-toggle="search"]')) {
      searchContainer.classList.remove('active');
    }
  });

  // Close search on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      searchContainer.classList.remove('active');
    }
  });
}

/**
 * Apply smart navigation highlighting based on current page
 */
function setupNavigationHighlighting() {
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

// Make functions globally available for external access
window.setupMobileMenu = setupMobileMenu;
window.toggleMobileMenu = toggleMobileMenu;
window.closeMobileMenu = closeMobileMenu;
window.setupSearchFunctionality = setupSearchFunctionality;
window.setupNavigationHighlighting = setupNavigationHighlighting;
