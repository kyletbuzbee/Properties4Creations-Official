/**
 * Properties 4 Creations - Component Loader
 * Loads header/footer/page banner and wires up header interactions.
 */
(function () {
  const P4C = (window.P4C = window.P4C || {});

  P4C.ComponentLoader = {
    init: function () {
      // Header
      if (!document.getElementById('main-header')) {
        this.loadHeader();
      } else {
        this.initHeaderInteractivity();
        this.applyNavigationHighlighting();
      }

      // Footer
      if (
        document.getElementById('footer-container') &&
        !document.getElementById('footer-container').innerHTML.trim()
      ) {
        this.loadFooter();
      }

      // Page banner (only on pages that include the placeholder)
      if (document.getElementById('page-banner-placeholder')) {
        this.loadPageBanner();
      }
    },

    loadHeader: async function () {
      try {
        const response = await fetch('components/header.html', {
          cache: 'no-cache',
        });
        if (!response.ok)
          throw new Error(`Failed to load header: ${response.status}`);

        const html = await response.text();
        const container = document.getElementById('header-container');

        if (container) {
          container.innerHTML = html;
        } else {
          document.body.insertAdjacentHTML('afterbegin', html);
        }

        this.initHeaderInteractivity();
        this.applyNavigationHighlighting();
      } catch (err) {
        console.error('❌ Error loading header:', err);
      }
    },

    loadFooter: async function () {
      try {
        const response = await fetch('components/footer.html', {
          cache: 'no-cache',
        });
        if (!response.ok)
          throw new Error(`Failed to load footer: ${response.status}`);

        const html = await response.text();
        const container = document.getElementById('footer-container');

        if (container) {
          container.innerHTML = html;
        } else {
          document.body.insertAdjacentHTML('beforeend', html);
        }
      } catch (err) {
        console.error('❌ Error loading footer:', err);
      }
    },

    loadPageBanner: async function () {
      try {
        const response = await fetch('components/page-banner.html', {
          cache: 'no-cache',
        });
        if (!response.ok)
          throw new Error(`Failed to load banner: ${response.status}`);

        const html = await response.text();
        const placeholder = document.getElementById('page-banner-placeholder');
        if (placeholder) placeholder.innerHTML = html;
      } catch (err) {
        console.error('❌ Error loading banner:', err);
      }
    },

    initHeaderInteractivity: function () {
      const menuToggle = document.getElementById('mobile-menu-toggle');
      const mobileMenu = document.getElementById('mobile-menu');
      if (!menuToggle || !mobileMenu) return;

      menuToggle.addEventListener('click', function (e) {
        e.stopPropagation();
        mobileMenu.classList.toggle('open');
        menuToggle.setAttribute(
          'aria-expanded',
          mobileMenu.classList.contains('open') ? 'true' : 'false',
        );
      });

      document.addEventListener('click', function (e) {
        if (!mobileMenu.contains(e.target) && !menuToggle.contains(e.target)) {
          mobileMenu.classList.remove('open');
          menuToggle.setAttribute('aria-expanded', 'false');
        }
      });

      mobileMenu.querySelectorAll('a').forEach((a) => {
        a.addEventListener('click', function () {
          mobileMenu.classList.remove('open');
          menuToggle.setAttribute('aria-expanded', 'false');
        });
      });
    },

    applyNavigationHighlighting: function () {
      // Navigation highlighting removed - violates inline style coding standards
      // Use CSS classes from stylesheet instead if highlighting is needed
    },
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () =>
      P4C.ComponentLoader.init(),
    );
  } else {
    P4C.ComponentLoader.init();
  }
})();
