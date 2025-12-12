/**
 * Properties 4 Creations - Component Loader
 * Loads header/footer/page banner and wires up header interactions.
 */
(function () {
  const P4C = (window.P4C = window.P4C || {});

  P4C.ComponentLoader = {
    init: function () {
      // Header
      if (!document.getElementById("main-header")) {
        this.loadHeader();
      } else {
        this.initHeaderInteractivity();
        this.applyNavigationHighlighting();
      }

      // Footer
      if (!document.querySelector("footer")) {
        this.loadFooter();
      }

      // Page banner (only on pages that include the placeholder)
      if (document.getElementById("page-banner-placeholder")) {
        this.loadPageBanner();
      }
    },

    loadHeader: async function () {
      try {
        const response = await fetch("components/header.html", { cache: "no-cache" });
        if (!response.ok) throw new Error(`Failed to load header: ${response.status}`);

        const html = await response.text();
        const container = document.getElementById("header-container");

        if (container) {
          container.innerHTML = html;
        } else {
          document.body.insertAdjacentHTML("afterbegin", html);
        }

        this.initHeaderInteractivity();
        this.applyNavigationHighlighting();
      } catch (err) {
        console.error("❌ Error loading header:", err);
      }
    },

    loadFooter: async function () {
      try {
        console.log("🔧 Loading footer from components/footer.html...");
        const response = await fetch("components/footer.html", { cache: "no-cache" });
        if (!response.ok) throw new Error(`Failed to load footer: ${response.status}`);

        const html = await response.text();
        console.log("📋 Footer HTML loaded, length:", html.length);

        const container = document.getElementById("footer-container");
        console.log("🏷️ Footer container found:", !!container, container);

        if (container) {
          container.innerHTML = html;
          console.log("✅ Footer HTML inserted into container");
        } else {
          document.body.insertAdjacentHTML("beforeend", html);
          console.log("✅ Footer HTML appended to body");
        }

        // Check footer elements exist after loading
        setTimeout(() => {
          const footer = document.querySelector("footer");
          console.log("🦶 Footer element found:", !!footer, footer);
        }, 100);

      } catch (err) {
        console.error("❌ Error loading footer:", err);
        console.error("❌ Error details:", err.message);

        // Fallback: create a basic footer
        const fallbackFooter = `<footer class="bg-brand-navy text-white text-center py-8 px-4">
          <div class="max-w-4xl mx-auto">
            <p>&copy; ${new Date().getFullYear()} Properties 4 Creations</p>
            <p class="text-sm text-slate-400 mt-2">Footer loading failed. Please refresh the page.</p>
          </div>
        </footer>`;

        const container = document.getElementById("footer-container");
        if (container) {
          container.innerHTML = fallbackFooter;
        }
      }
    },

    loadPageBanner: async function () {
      try {
        const response = await fetch("components/page-banner.html", { cache: "no-cache" });
        if (!response.ok) throw new Error(`Failed to load banner: ${response.status}`);

        const html = await response.text();
        const placeholder = document.getElementById("page-banner-placeholder");
        if (placeholder) placeholder.innerHTML = html;
      } catch (err) {
        console.error("❌ Error loading banner:", err);
      }
    },

    initHeaderInteractivity: function () {
      const menuToggle = document.getElementById("mobile-menu-toggle");
      const mobileMenu = document.getElementById("mobile-menu");
      if (!menuToggle || !mobileMenu) return;

      menuToggle.addEventListener("click", function (e) {
        e.stopPropagation();
        mobileMenu.classList.toggle("open");
        menuToggle.setAttribute("aria-expanded", mobileMenu.classList.contains("open") ? "true" : "false");
      });

      document.addEventListener("click", function (e) {
        if (!mobileMenu.contains(e.target) && !menuToggle.contains(e.target)) {
          mobileMenu.classList.remove("open");
          menuToggle.setAttribute("aria-expanded", "false");
        }
      });

      mobileMenu.querySelectorAll("a").forEach((a) => {
        a.addEventListener("click", function () {
          mobileMenu.classList.remove("open");
          menuToggle.setAttribute("aria-expanded", "false");
        });
      });
    },

    applyNavigationHighlighting: function () {
      const current = window.location.pathname.split("/").pop() || "index.html";
      document.querySelectorAll("nav a[href]").forEach((link) => {
        const href = link.getAttribute("href");
        if (href === current) link.classList.add("bg-white/20", "rounded-lg");
      });
    },
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => P4C.ComponentLoader.init());
  } else {
    P4C.ComponentLoader.init();
  }
})();
