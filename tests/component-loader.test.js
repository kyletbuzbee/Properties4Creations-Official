import { JSDOM } from 'jsdom';

/**
 * Unit Tests for Component Loader (js/component-loader.js)
 * Tests dynamic component loading, event handling, and navigation
 */

describe('ComponentLoader', () => {
  let dom;
  let window;
  let document;
  let P4C;

  beforeEach(() => {
    // Setup JSDOM
    dom = new JSDOM(`
      <html>
        <body>
          <div id="header-container"></div>
          <div id="footer-container"></div>
          <div id="header-placeholder"></div>
          <div id="footer-placeholder"></div>
          <nav>
            <div><button id="mobile-menu-toggle">Menu</button></div>
            <div id="mobile-menu"><div><a href="/test">Test</a></div></div>
          </nav>
        </body>
      </html>
    `);

    window = dom.window;
    document = window.document;

    // Mock fetch for testing
    global.fetch = jest.fn(() => Promise.resolve({
      ok: true,
      text: () => Promise.resolve('<div id="main-header">Loaded Header</div>')
    }));

    // Import and setup P4C namespace
    P4C = {};
    window.P4C = P4C;

    // Load the component loader script
    require('../js/component-loader.js');

    // Override DOM globals for testing
    global.window = window;
    global.document = document;
    global.window.P4C = P4C;
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('init()', () => {
    test('should initialize with header already present', () => {
      // Setup header already exists
      const existingHeader = document.createElement('div');
      existingHeader.id = 'main-header';
      document.body.appendChild(existingHeader);

      P4C.ComponentLoader.init();

      expect(P4C.ComponentLoader.initHeaderInteractivity).toHaveBeenCalled;
      expect(P4C.ComponentLoader.applyNavigationHighlighting).toHaveBeenCalled;
      expect(fetch).not.toHaveBeenCalled();
    });

    test('should load header when not present', () => {
      const mockLoadHeader = jest.spyOn(P4C.ComponentLoader, 'loadHeader');

      P4C.ComponentLoader.init();

      expect(mockLoadHeader).toHaveBeenCalled();
    });

    test('should load footer when footer-container exists but is empty', () => {
      const mockLoadFooter = jest.spyOn(P4C.ComponentLoader, 'loadFooter');

      P4C.ComponentLoader.init();

      expect(mockLoadFooter).toHaveBeenCalled();
    });

    test('should skip footer loading when footer already has content', () => {
      document.getElementById('footer-container').innerHTML = '<div>Existing footer</div>';

      const mockLoadFooter = jest.spyOn(P4C.ComponentLoader, 'loadFooter');

      P4C.ComponentLoader.init();

      expect(mockLoadFooter).not.toHaveBeenCalled();
    });

    test('should load page banner when placeholder exists', () => {
      const bannerPlaceholder = document.createElement('div');
      bannerPlaceholder.id = 'page-banner-placeholder';
      document.body.appendChild(bannerPlaceholder);

      const mockLoadBanner = jest.spyOn(P4C.ComponentLoader, 'loadPageBanner');

      P4C.ComponentLoader.init();

      expect(mockLoadBanner).toHaveBeenCalled();
    });
  });

  describe('loadHeader()', () => {
    test('should fetch component and insert HTML', async () => {
      const container = document.getElementById('header-container');
      const mockHtml = '<div id="main-header">Header Content</div>';

      global.fetch.mockResolvedValue({
        ok: true,
        text: () => Promise.resolve(mockHtml)
      });

      await P4C.ComponentLoader.loadHeader();

      expect(global.fetch).toHaveBeenCalledWith('components/header.html', { cache: 'no-cache' });
      expect(document.getElementById('main-header')).toBeTruthy();
      expect(document.getElementById('main-header').textContent).toBe('Header Content');
    });

    test('should handle fetch errors gracefully', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      global.fetch.mockRejectedValue(new Error('Network error'));

      await P4C.ComponentLoader.loadHeader();

      expect(consoleSpy).toHaveBeenCalledWith('❌ Error loading header:', expect.any(Error));

      consoleSpy.mockRestore();
    });
  });

  describe('loadFooter()', () => {
    test('should load footer successfully', async () => {
      const container = document.getElementById('footer-container');
      const mockHtml = '<footer>Footer Content</footer>';

      global.fetch.mockResolvedValue({
        ok: true,
        text: () => Promise.resolve(mockHtml)
      });

      await P4C.ComponentLoader.loadFooter();

      expect(global.fetch).toHaveBeenCalledWith('components/footer.html', { cache: 'no-cache' });
      expect(container.innerHTML).toBe(mockHtml);
    });
  });

  describe('loadPageBanner()', () => {
    test('should load page banner into placeholder', async () => {
      const placeholder = document.createElement('div');
      placeholder.id = 'page-banner-placeholder';
      document.body.appendChild(placeholder);

      const mockBanner = '<div>Banner Content</div>';

      global.fetch.mockResolvedValue({
        ok: true,
        text: () => Promise.resolve(mockBanner)
      });

      await P4C.ComponentLoader.loadPageBanner();

      expect(global.fetch).toHaveBeenCalledWith('components/page-banner.html', { cache: 'no-cache' });
      expect(placeholder.innerHTML).toBe(mockBanner);
    });
  });

  describe('initHeaderInteractivity()', () => {
    beforeEach(() => {
      // Reset the menu to initial state
      const menu = document.getElementById('mobile-menu');
      if (menu) menu.classList.remove('open');
    });

    test('should set up mobile menu toggle click handler', () => {
      const toggleBtn = document.getElementById('mobile-menu-toggle');
      const menu = document.getElementById('mobile-menu');

      P4C.ComponentLoader.initHeaderInteractivity();

      toggleBtn.click();
      expect(menu.classList.contains('open')).toBe(true);
      expect(toggleBtn.getAttribute('aria-expanded')).toBe('true');

      toggleBtn.click();
      expect(menu.classList.contains('open')).toBe(false);
      expect(toggleBtn.getAttribute('aria-expanded')).toBe('false');
    });

    test('should close menu when clicking outside', () => {
      const toggleBtn = document.getElementById('mobile-menu-toggle');
      const menu = document.getElementById('mobile-menu');

      P4C.ComponentLoader.initHeaderInteractivity();

      // Open the menu
      toggleBtn.click();
      expect(menu.classList.contains('open')).toBe(true);

      // Click on document (outside menu)
      document.body.click();

      expect(menu.classList.contains('open')).toBe(false);
      expect(toggleBtn.getAttribute('aria-expanded')).toBe('false');
    });

    test('should close menu when link is clicked', () => {
      const toggleBtn = document.getElementById('mobile-menu-toggle');
      const menu = document.getElementById('mobile-menu');
      const link = menu.querySelector('a');

      P4C.ComponentLoader.initHeaderInteractivity();

      // Open the menu
      toggleBtn.click();
      expect(menu.classList.contains('open')).toBe(true);

      // Click on a link
      link.click();

      expect(menu.classList.contains('open')).toBe(false);
      expect(toggleBtn.getAttribute('aria-expanded')).toBe('false');
    });
  });

  describe('applyNavigationHighlighting()', () => {
    test('should not throw error (navigation highlighting removed)', () => {
      expect(() => {
        P4C.ComponentLoader.applyNavigationHighlighting();
      }).not.toThrow();
    });
  });
});
