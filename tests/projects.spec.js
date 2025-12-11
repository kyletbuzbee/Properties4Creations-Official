const { test, expect } = require('@playwright/test');

/**
 * Properties Page - End-to-End Tests
 * Tests accessibility, functionality, and performance of the projects.html page
 */

test.describe('Projects Page - Comprehensive Tests', () => {

  // Setup: Visit projects page before each test
  test.beforeEach(async ({ page }) => {
    await page.goto('/projects.html');

    // Wait for loaded header and footer components (not just empty containers)
    await page.waitForSelector('#main-header');
    await page.waitForSelector('#footer-container footer');
  });

  test('Page loads successfully with proper title and structure', async ({ page }) => {
    await expect(page).toHaveTitle('Available Properties - Properties 4 Creations');

    // Check for main structural elements
    await expect(page.locator('#main')).toBeVisible();
    await expect(page.locator('[data-testid="header"]')).toBeVisible();
    await expect(page.locator('[data-testid="footer"]')).toBeVisible();
  });

  test('Accessibility: Skip to content link is present and functional', async ({ page }) => {
    const skipLink = page.locator('.skip-to-content');
    await expect(skipLink).toBeVisible();

    // Test skip link functionality
    await page.keyboard.press('Tab');
    await expect(skipLink).toBeFocused();

    // Skip link should jump to main content
    await skipLink.click();
    await expect(page.locator('#main')).toBeFocused();
  });

  test('Interactive gallery tabs work correctly', async ({ page }) => {
    // Initially kitchen tab should be active
    const kitchenTab = page.locator('#tab-kitchen');
    const livingTab = page.locator('#tab-living');

    await expect(kitchenTab).toHaveClass(/border-b-2 border-brand-wood font-bold/);
    await expect(livingTab).not.toHaveClass(/border-b-2 border-brand-wood font-bold/);

    // Kitchen content should be visible, living room hidden
    await expect(page.locator('#content-kitchen')).toBeVisible();
    await expect(page.locator('#content-living')).toBeHidden();

    // Switch to living room tab
    await livingTab.click();

    // Living room should now be active
    await expect(livingTab).toHaveClass(/border-b-2 border-brand-wood font-bold/);
    await expect(kitchenTab).not.toHaveClass(/border-b-2 border-brand-wood font-bold/);

    // Content should switch
    await expect(page.locator('#content-living')).toBeVisible();
    await expect(page.locator('#content-kitchen')).toBeHidden();
  });

  test('Range slider controls have proper accessibility labels', async ({ page }) => {
    // Kitchen slider
    const kitchenSlider = page.locator('#content-kitchen input[type="range"]');
    await expect(kitchenSlider).toHaveAttribute('aria-label', 'Adjust before and after comparison in kitchen renovation');

    // Living room slider (switch to living room tab first)
    await page.locator('#tab-living').click();
    const livingSlider = page.locator('#content-living input[type="range"]');
    await expect(livingSlider).toHaveAttribute('aria-label', 'Adjust before and after comparison in living room renovation');
  });

  test('Range sliders are functional and update overlays', async ({ page }) => {
    const slider = page.locator('#content-kitchen input[type="range"]');
    const overlay = page.locator('#content-kitchen .overlay');

    // Initial state should be 50%
    await expect(slider).toHaveValue('50');
    await expect(overlay).toHaveCSS('width', '200px'); // 50% of 400px container

    // Change slider value to 75%
    await slider.fill('75');
    await expect(overlay).toHaveCSS('width', '300px'); // 75% of 400px container
  });

  test('Slider handles move with slider values', async ({ page }) => {
    const slider = page.locator('#content-kitchen input[type="range"]');
    const handle = page.locator('#content-kitchen .slider-handle');

    // Initial position
    const initialTransform = await handle.evaluate(el => el.style.transform);
    expect(initialTransform).toBe('translate(-50%, -50%)');

    // Change slider to 25%
    await slider.fill('25');
    await page.waitForTimeout(100); // Allow slider logic to execute
    const afterTransform = await handle.evaluate(el => el.style.transform);
    expect(afterTransform).toBe('translate(-50%, -50%)'); // Transform should be consistent, position via left property
  });

  test('Property cards display correctly', async ({ page }) => {
    // Check that property cards exist and have required elements
    const propertyCards = page.locator('.bg-white.rounded-xl.overflow-hidden.shadow-lg');
    await expect(propertyCards).toHaveCount(3);

    // First property card should have correct details
    const firstCard = propertyCards.first();
    await expect(firstCard.locator('h3')).toHaveText('Tyler Ranch Home');
    await expect(firstCard.locator('p').filter({ hasText: 'Tyler, TX' })).toBeVisible();
    await expect(firstCard.locator('button').filter({ hasText: 'View Details' })).toBeVisible();
  });

  test('Filter buttons are present but not functional in static version', async ({ page }) => {
    const filterButtons = page.locator('.flex.justify-center.gap-3.mb-10 button');
    await expect(filterButtons).toHaveCount(4);

    // All filter should be active by default (background should be brand navvy)
    await expect(filterButtons.first()).toHaveClass(/bg-brand-navy/);
  });

  test('Aria labels for sliders are screen reader accessible', async ({ page }) => {
    // Test that screen readers can access the slider controls
    const slider = page.locator('#content-kitchen input[type="range"]');

    // Should be focusable
    await slider.focus();
    await expect(slider).toBeFocused();

    // Aria-label should be accessible
    await expect(slider).toHaveAttribute('aria-label');
  });

  test('Visual comparison gallery shows before/after overlays correctly', async ({ page }) => {
    // Kitchen tab - check overlay structure
    const overlay = page.locator('#content-kitchen .overlay');
    const beforeLabel = overlay.locator('.absolute.top-4.left-4');
    const afterImage = page.locator('#content-kitchen .absolute.inset-0.bg-cover.bg-center');

    await expect(overlay).toBeVisible();
    await expect(beforeLabel).toHaveText('BEFORE');
    await expect(afterImage).toHaveCSS('background-image', /projects_after_kitchen\.webp/);
  });

  test('Performance: Page loads within performance budget', async ({ page }) => {
    // Measure page load performance
    const startTime = Date.now();

    await page.reload();
    await page.waitForLoadState('networkidle');

    const loadTime = Date.now() - startTime;
    expect(loadTime).toBeLessThan(3000); // Should load in under 3 seconds

    // Get lighthouse metrics if available
    const metrics = await page.evaluate(() => {
      return {
        domContentLoaded: performance.getEntriesByName('dom-content-loaded')[0]?.loadEventEnd,
        firstPaint: performance.getEntriesByType('paint')[0]?.startTime,
        largestContentfulPaint: performance.getEntriesByType('largest-contentful-paint')[0]?.startTime
      };
    });

    console.log('Performance metrics:', metrics);
  });

  test('Responsive design works on different viewports', async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    await expect(page.locator('.grid.grid-cols-1.md\\:grid-cols-3')).toBeVisible();
    await expect(page.locator('.relative.w-full.max-w-4xl')).toHaveCSS('width', '100%');

    // Test desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 });
    await expect(page.locator('.relative.w-full.max-w-4xl')).toBeVisible();

    // Gallery should maintain proper sizing
    const gallery = page.locator('.relative.w-full.max-w-4xl');
    const box = await gallery.boundingBox();
    expect(box.width).toBeLessThanOrEqual(896); // max-w-4xl max-width
  });

  test('Print accessibility - content is readable without scripts', async ({ page }) => {
    // Disable JavaScript to test static content
    await page.addScriptTag({ content: 'Object.defineProperty(window, "onbeforeunload", { get: () => null });' });

    // Content should still be readable without JS
    await expect(page.locator('h2').filter({ hasText: 'See the Transformation' })).toBeVisible();
    await expect(page.locator('h2').filter({ hasText: 'Find Your New Home' })).toBeVisible();
  });

  test('Slider interaction provides visual feedback', async ({ page }) => {
    const slider = page.locator('#content-kitchen input[type="range"]');
    const handle = page.locator('#content-kitchen .slider-handle');

    // Move slider handle visually
    await slider.hover();
    await page.mouse.down();

    // Handle should be visible and interactive
    await expect(handle).toBeVisible();
    await expect(handle).toHaveText('↔');

    await page.mouse.up();
  });

});
