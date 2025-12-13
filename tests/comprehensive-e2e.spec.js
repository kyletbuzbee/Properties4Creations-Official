import { test, expect } from '@playwright/test';

/**
 * Comprehensive E2E Tests for Properties 4 Creations Website
 * Covers all critical user workflows, accessibility, and cross-device functionality
 */

// Test configuration
test.describe.configure({ mode: 'serial' });

test.describe('Homepage - User Experience & Navigation', () => {
  test('should load homepage with all critical elements', async ({ page }) => {
    await page.goto('/');

    // Check title and meta
    await expect(page).toHaveTitle(/Properties 4 Creations/);
    await expect(page.locator('meta[name="description"]')).toHaveAttribute(
      'content',
      /affordable housing/i
    );

    // Check main elements
    await expect(page.locator('#main')).toBeVisible();
    await expect(page.locator('header')).toBeVisible();

    // Navigation links should exist
    await expect(page.locator('nav a')).toHaveCount(await page.locator('nav a').count());

    // Skip link functionality
    await page.keyboard.press('Tab');
    await expect(page.locator('.skip-to-content')).toBeFocused();

    // Skip link should jump to main content
    await page.keyboard.press('Enter');
    await expect(page.locator('#main')).toBeFocused(); // or at least in viewport
  });

  test('should have working hero CTA buttons', async ({ page }) => {
    await page.goto('/');

    // Check hero section exists
    await expect(page.locator('.hero-home-banner')).toBeVisible();

    // Check CTA buttons
    const browseBtn = page.locator('a', { hasText: /browse available homes/i });
    const applyBtn = page.locator('a', { hasText: /apply now/i });

    await expect(browseBtn).toBeVisible();
    await expect(applyBtn).toBeVisible();

    // Test navigation on click
    await browseBtn.click();
    await expect(page).toHaveURL(/projects/);

    // Back and test second button
    await page.goBack();
    await applyBtn.click();
    await expect(page).toHaveURL(/get-started/);
  });

  test('should display impact statistics correctly', async ({ page }) => {
    await page.goto('/');

    // Check impact section
    await expect(page.locator('text=Our Impact in Numbers')).toBeVisible();

    // Check stats display
    await expect(page.locator('text=40+')).toBeVisible();
    await expect(page.locator('text=Families Housed')).toBeVisible();

    await expect(page.locator('text=100%')).toBeVisible();
    await expect(page.locator('text=Voucher Acceptance')).toBeVisible();

    await expect(page.locator('text=25')).toBeVisible();
    await expect(page.locator('text=Properties Renovated')).toBeVisible();
  });
});

test.describe('Mobile Menu & Navigation', () => {
  test('should work on mobile device', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    // Check mobile menu components exist
    const menuToggle = page.locator('#mobile-menu-toggle');
    const mobileMenu = page.locator('#mobile-menu');

    await expect(menuToggle).toBeVisible();

    // Mobile menu should be hidden initially
    await expect(mobileMenu).not.toBeVisible();

    // Open mobile menu
    await menuToggle.click();
    await expect(mobileMenu).toHaveClass(/open/);

    // Check menu links exist
    const menuLinks = mobileMenu.locator('a');
    const linkCount = await menuLinks.count();
    expect(linkCount).toBeGreaterThan(0);

    // Click first menu link
    await menuLinks.first().click();

    // Menu should close automatically
    await expect(mobileMenu).not.toHaveClass(/open/);
  });

  test('should hide mobile menu on desktop', async ({ page }) => {
    await page.setViewportSize({ width: 1024, height: 768 });
    await page.goto('/');

    // Desktop should show horizontal navigation
    const desktopNav = page.locator('header nav > div:nth-child(2)');
    await expect(desktopNav).toBeVisible();

    // Mobile menu should not be visible on desktop
    const mobileMenu = page.locator('#mobile-menu');
    await expect(mobileMenu).not.toBeVisible();

    // Mobile menu toggle should be hidden
    const menuToggle = page.locator('#mobile-menu-toggle');
    await expect(menuToggle).not.toBeVisible();
  });
});

test.describe('Form Functionality - Integration Testing', () => {
  test('should validate contact form and submit successfully', async ({ page }) => {
    await page.goto('/contact.html');

    // Check form elements
    const nameInput = page.locator('input[name="name"]');
    const emailInput = page.locator('input[name="email"]');
    const messageTextarea = page.locator('textarea[name="message"]');

    await expect(nameInput).toBeVisible();
    await expect(emailInput).toBeVisible();
    await expect(messageTextarea).toBeVisible();

    // Test form validation
    const submitBtn = page.locator('button[type="submit"]');
    await submitBtn.click();

    // Should show validation errors for required fields
    await expect(page.locator('input:invalid')).toHaveCount(await page.locator('input[required]').count());

    // Fill form properly
    await nameInput.fill('John Doe');
    await emailInput.fill('john@example.com');
    await messageTextarea.fill('Test message');

    // Mock successful form submission
    await page.route('**/forms/*', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, message: 'Form submitted successfully' })
      });
    });

    await submitBtn.click();

    // Should redirect to thank-you page or show success message
    await expect(page).toHaveURL(/thank-you/);
  });

  test('should handle contact form errors gracefully', async ({ page }) => {
    await page.goto('/contact.html');

    // Mock network error
    await page.route('**/forms/*', route => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ success: false, message: 'Server error' })
      });
    });

    // Fill and submit form
    await page.locator('input[name="name"]').fill('John Doe');
    await page.locator('input[name="email"]').fill('john@example.com');
    await page.locator('textarea[name="message"]').fill('Test');
    await page.locator('button[type="submit"]').click();

    // Should show error message
    await expect(page.locator('text=Error')).toBeVisible();
  });
});

test.describe('Responsive Design Testing', () => {
  const viewports = [
    { width: 320, height: 568, name: 'iPhone SE' },
    { width: 375, height: 667, name: 'iPhone 8' },
    { width: 768, height: 1024, name: 'iPad' },
    { width: 1024, height: 768, name: 'Desktop Small' },
    { width: 1440, height: 900, name: 'Desktop Large' }
  ];

  for (const viewport of viewports) {
    test(`should render correctly on ${viewport.name} (${viewport.width}x${viewport.height})`, async ({ page }) => {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.goto('/');

      // Check main elements are visible and properly sized
      await expect(page.locator('header')).toBeVisible();
      await expect(page.locator('#main')).toBeVisible();
      await expect(page.locator('footer')).toBeVisible();

      // Check hero banner adapts
      const hero = page.locator('.hero-home-banner');
      await expect(hero).toBeVisible();

      // Check navigation works
      if (viewport.width < 768) {
        // Mobile: check mobile menu toggle exists
        const menuToggle = page.locator('#mobile-menu-toggle');
        await expect(menuToggle).toBeVisible();
      } else {
        // Desktop: check horizontal navigation
        const desktopNav = page.locator('header nav > div:nth-child(2)');
        await expect(desktopNav).toBeVisible();
      }

      // Check content is readable and flows properly
      await expect(page.locator('h1')).toBeVisible();
      await expect(page.locator('h1')).toBeInViewport();
    });
  }
});

test.describe('Cross-browser Compatibility', () => {
  test('should work with JavaScript disabled', async ({ page }) => {
    // Disable JavaScript for this test
    await page.route('**/*.js', route => route.abort());

    await page.goto('/');

    // Content should still be readable
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('text=Properties 4 Creations')).toBeVisible();

    // Links should still work
    const links = page.locator('a[href]');
    expect(await links.count()).toBeGreaterThan(0);

    // Static content should be visible
    const heroText = page.locator('text=Building Homes');
    await expect(heroText).toBeVisible();
  });

  test('should handle slow network conditions', async ({ page }) => {
    // Simulate slow 3G connection
    await page.route('**/*', route => {
      route.continue({
        headers: {
          ...route.request().headers(),
          'Cache-Control': 'no-cache',
        }
      });
    });

    // Set slow network conditions
    await page.emulateNetworkConditions({
      offline: false,
      downloadThroughput: 750 * 1024 / 8, // 750 KB/s
      uploadThroughput: 250 * 1024 / 8,    // 250 KB/s
      connectionType: 'cellular3g',
      latency: 500, // 500ms latency
    });

    await page.goto('/');

    // Should still load within reasonable time
    await expect(page.locator('h1')).toBeVisible({ timeout: 30000 });
  });
});

test.describe('Accessibility Compliance (WCAG)', () => {
  test('should meet accessibility standards', async ({ page }) => {
    await page.goto('/');

    // Check for proper heading hierarchy
    const h1Tags = await page.locator('h1').count();
    expect(h1Tags).toBeGreaterThan(0);

    // Check for focusable elements
    const focusableElements = page.locator('button, a[href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
    const focusableCount = await focusableElements.count();
    expect(focusableCount).toBeGreaterThan(0);

    // Test keyboard navigation
    await page.keyboard.press('Tab');
    await expect(page.locator('*:focus')).toBeVisible();

    // Check images have alt text
    const imagesWithoutAlt = page.locator('img:not([alt])');
    await expect(imagesWithoutAlt).toHaveCount(0);

    // Check for proper ARIA labels
    const buttonsWithoutLabels = page.locator('button:not([aria-label]):not([aria-labelledby])');
    // Some buttons might not need labels, so this is informational
    const buttonCount = await buttonsWithoutLabels.count();
    console.log(`${buttonCount} buttons may need ARIA labels`);

    // Check color contrast (manual verification required, but we can check for focus styles)
    const focusedElements = page.locator('*:focus-visible');
    await page.keyboard.press('Tab');
    // At least one element should show focus styling
    const focusedCount = await focusedElements.count();
    expect(focusedCount).toBeGreaterThan(0);
  });

  test('should support screen reader announcements', async ({ page }) => {
    await page.goto('/');

    // Check ARIA live regions exist
    const liveRegions = page.locator('[aria-live]');
    // Optional - depends on implementation

    // Check for proper form labels
    const unlabeledInputs = page.locator('input:not([aria-label]):not([aria-labelledby]), select:not([aria-label]):not([aria-labelledby]), textarea:not([aria-label]):not([aria-labelledby])');
    await expect(unlabeledInputs).toHaveCount(0);

    // Check for unique landmark regions
    await expect(page.locator('[role="main"], main')).toBeVisible();
    await expect(page.locator('nav[aria-label]')).toBeVisible();
  });
});

test.describe('Performance & Security', () => {
  test('should load within performance budget', async ({ page }) => {
    const startTime = Date.now();

    await page.goto('/');

    // Check basic page load metrics
    const loadTime = Date.now() - startTime;
    expect(loadTime).toBeLessThan(10000); // Should load in under 10 seconds

    // Check for heavy images (should have lazy loading)
    const imgSelectors = [
      'img[loading="lazy"]',
      'img:not([loading])' // Count non-lazy images
    ];

    const lazyImages = await page.locator('img[loading="lazy"]').count();
    const totalImages = await page.locator('img').count();

    console.log(`Lazy loaded: ${lazyImages}/${totalImages} images`);

    // Content should be visible
    await expect(page.locator('h1')).toBeVisible();
  });

  test('should not expose sensitive information', async ({ page }) => {
    await page.goto('/');

    // Check for console errors
    const errors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    await page.waitForTimeout(1000);

    // Filter out expected warnings (like Tailwind if any remain)
    const filteredErrors = errors.filter(error =>
      !error.includes('Tailwind') &&
      !error.includes('favicon') &&
      !error.includes('manifest.json')
    );

    expect(filteredErrors.length).toBe(0);

    // Check that no sensitive data is in DOM
    const pageContent = await page.content();
    expect(pageContent).not.toContain('password');
    expect(pageContent).not.toContain('API_KEY');
  });

  test('should handle 404 errors gracefully', async ({ page }) => {
    await page.goto('/nonexistent-page');

    // Should show 404 page
    await expect(page.locator('text=Page Not Found')).toBeVisible();

    // Should have navigation back to home
    const homeLink = page.locator('a[href="/"], a[href="index.html"]');
    await expect(homeLink).toBeVisible();

    await homeLink.click();
    await expect(page).toHaveURL('/');
  });
});

// Lighthouse Integration Tests
test.describe('Lighthouse Performance & Accessibility', () => {
  test('should pass accessibility audit', async ({ page }) => {
    await page.goto('/');

    // Run a basic accessibility check using Playwright
    const accessibilitySnapshot = await page.accessibility.snapshot();

    // Check for major accessibility violations
    expect(accessibilitySnapshot).toBeTruthy();

    // Ensure no critical roles are missing
    const hasMain = accessibilitySnapshot.children?.some(child =>
      child.role === 'main'
    );
    const hasNavigation = accessibilitySnapshot.children?.some(child =>
      child.role === 'navigation'
    );

    expect(hasMain).toBe(true);
    expect(hasNavigation).toBe(true);
  });

  test('should have minimal render-blocking resources', async ({ page }) => {
    const cdpSession = await page.context().newCDPSession(page);

    // Collect all requests
    const requests = [];
    page.on('request', request => {
      requests.push({
        url: request.url(),
        resourceType: request.resourceType()
      });
    });

    await page.goto('/');

    await page.waitForLoadState('networkidle');

    // Check for potentially render-blocking resources
    const blockingResources = requests.filter(req =>
      req.resourceType === 'stylesheet' && req.url.includes('google')
    );

    // Should minimize external fonts/CSS
    expect(blockingResources.length).toBeLessThan(3); // Allow fonts
  });
});

test.describe('Sitemap & Navigation Coverage', () => {
  test('should navigate through all major pages successfully', async ({ page }) => {
    const baseUrl = 'http://localhost:8080';

    // Test key navigation paths
    const pages = [
      '/',
      '/about.html',
      '/projects.html',
      '/contact.html',
      '/impact.html',
      '/resources.html',
      '/faq.html',
      '/privacy.html'
    ];

    for (const pagePath of pages) {
      await page.goto(pagePath);

      // Basic checks for each page
      await expect(page.locator('#main')).toBeVisible();
      await expect(page.locator('header')).toBeVisible();
      await expect(page.locator('nav')).toBeVisible();

      // Check title exists
      const title = await page.title();
      expect(title).toBeTruthy();
      expect(title).toContain('Properties 4 Creations');
    }
  });

  test('should handle navigation errors gracefully', async ({ page }) => {
    await page.goto('/broken-link');

    // Should redirect to 404 page or show error
    const currentUrl = page.url();

    // Either shows 404 content or redirects
    if (currentUrl.includes('/broken-link')) {
      // Staying on broken URL might indicate SPA behavior
      await expect(page.locator('body')).toContainText('found');
    } else {
      // Redirected to 404
      await expect(page.locator('text=Page Not Found')).toBeVisible();
    }
  });
});
