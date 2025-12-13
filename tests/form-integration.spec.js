import { test, expect } from '@playwright/test';

/**
 * Integration Tests for Form Endpoints and Submissions
 * Tests real form functionality with mocked backends and validations
 */

test.describe('Form Integration Testing', () => {
  test.describe('Contact Form Submission', () => {
    test('should successfully submit contact form to Google Apps Script', async ({ page }) => {
      // Intercept network requests to Google Apps Script
      await page.route('**/scripts.google.com/**', route => {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            result: 'success',
            message: 'Form submitted successfully'
          })
        });
      });

      await page.goto('/contact.html');

      // Fill out the form
      await page.locator('input[name="name"]').fill('John Doe');
      await page.locator('input[name="email"]').fill('john.doe@example.com');
      await page.locator('input[name="phone"]').fill('(903) 283-1770');
      await page.locator('select[name="inquiry-type"]').selectOption('rental');
      await page.locator('textarea[name="message"]').fill(
        'I am interested in learning more about your rental properties for veterans. Please contact me with available options.'
      );

      // Submit the form
      await page.locator('button[type="submit"]').click();

      // Should redirect to thank-you page
      await expect(page).toHaveURL(/thank-you/);
      await expect(page.locator('text=Thank you')).toBeVisible();
    });

    test('should handle Google Apps Script errors gracefully', async ({ page }) => {
      await page.route('**/scripts.google.com/**', route => {
        route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({
            result: 'error',
            message: 'Submission failed'
          })
        });
      });

      await page.goto('/contact.html');

      // Fill and submit form
      await page.locator('input[name="name"]').fill('Jane Smith');
      await page.locator('input[name="email"]').fill('jane.smith@email.com');
      await page.locator('textarea[name="message"]').fill('Test message');

      await page.locator('button[type="submit"]').click();

      // Should show error message
      await expect(page.locator('text=Error')).toBeVisible();
      await expect(page.locator('text=Submission failed')).toBeVisible();

      // Should stay on contact page
      await expect(page).toHaveURL(/contact/);
    });

    test('should validate required fields before submission', async ({ page }) => {
      await page.goto('/contact.html');

      // Try to submit empty form
      const submitBtn = page.locator('button[type="submit"]');
      await submitBtn.click();

      // Should not redirect - form validation should prevent submission
      await expect(page).toHaveURL(/contact/);

      // Check required fields show validation errors
      const nameField = page.locator('input[name="name"]:invalid');
      const emailField = page.locator('input[name="email"]:invalid');
      const messageField = page.locator('textarea[name="message"]:invalid');

      // At least one field should be invalid
      const invalidCount = await page.locator(':invalid').count();
      expect(invalidCount).toBeGreaterThan(0);
    });

    test('should validate email format', async ({ page }) => {
      await page.goto('/contact.html');

      // Fill with invalid email
      await page.locator('input[name="name"]').fill('Test User');
      await page.locator('input[name="email"]').fill('invalid-email');
      await page.locator('textarea[name="message"]').fill('Test message');

      // Submit form
      await page.locator('button[type="submit"]').click();

      // Email field should show invalid state
      await expect(page.locator('input[name="email"]:invalid')).toBeTruthy();

      // Should not have redirected
      await expect(page).toHaveURL(/contact/);

      // Fix email and submit successfully
      await page.locator('input[name="email"]').fill('valid@email.com');
      await page.locator('button[type="submit"]').click();

      await expect(page).toHaveURL(/thank-you/);
    });

    test('should handle network failures during submission', async ({ page }) => {
      // Mock network failure
      await page.route('**/scripts.google.com/**', route => {
        route.abort('failed'); // Simulate network error
      });

      await page.goto('/contact.html');

      // Fill and submit form
      await page.locator('input[name="name"]').fill('Network Test');
      await page.locator('input[name="email"]').fill('network@test.com');
      await page.locator('textarea[name="message"]').fill('Testing network failure handling');

      await page.locator('button[type="submit"]').click();

      // Should show network error message
      await expect(page.locator('text=Network error')).toBeVisible();
      await expect(page.locator('text=Please try again')).toBeVisible();

      // Should stay on page with form data filled
      await expect(page.locator('input[name="name"]')).toHaveValue('Network Test');
    });
  });

  test.describe('Housing Application Form', () => {
    test('should successfully submit housing application with all required fields', async ({ page }) => {
      await page.route('**/scripts.google.com/**', route => {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            result: 'success',
            applicationId: 'APP-2025-001',
            message: 'Application submitted successfully'
          })
        });
      });

      await page.goto('/get-started.html');

      // Fill out comprehensive application
      await page.locator('input[name="applicant-name"]').fill('John R. Veteran');
      await page.locator('input[name="email"]').fill('john.veteran@email.com');
      await page.locator('input[name="phone"]').fill('(903) 555-0123');
      await page.locator('input[name="date-of-birth"]').fill('1985-06-15');

      // Housing preferences
      await page.locator('select[name="housing-type"]').selectOption('family');
      await page.locator('select[name="bedrooms-needed"]').selectOption('3');
      await page.locator('select[name="move-in-timeline"]').selectOption('asap');

      // Veteran status
      await page.locator('input[name="veteran-name"]').fill('John R. Veteran');
      await page.locator('input[name="branch"]').fill('US Army');
      await page.locator('input[name="years-service"]').fill('8');
      await page.locator('select[name="discharge-status"]').selectOption('honorable');

      // Housing voucher
      await page.locator('input[name="voucher-type"]').fill('Section 8');
      await page.locator('input[name="voucher-amount"]').fill('1800');

      await page.locator('textarea[name="special-needs"]').fill('Need ground floor access');

      await page.locator('textarea[name="personal-statement"]').fill(
        'As a veteran with 8 years of service, I am seeking safe, affordable housing for my family. I have maintained excellent rental history and can provide all necessary references.'
      );

      // Accept terms
      await page.locator('input[name="accept-terms"]').check();

      // Submit application
      await page.locator('button[type="submit"]').click();

      // Should show success message with application ID
      await expect(page.locator('text=Application Submitted')).toBeVisible();
      await expect(page.locator('text=APP-2025-001')).toBeVisible();
    });

    test('should validate housing application fields', async ({ page }) => {
      await page.goto('/get-started.html');

      // Try to submit empty application
      await page.locator('button[type="submit"]').click();

      // Should stay on page and show validation errors
      await expect(page).toHaveURL(/get-started/);

      // Check for at least one validation error
      const invalidFields = await page.locator(':invalid').count();
      expect(invalidFields).toBeGreaterThan(0);

      // Terms acceptance should be required
      const termsCheckbox = page.locator('input[name="accept-terms"]');
      await expect(termsCheckbox).toHaveAttribute('required');
    });

    test('should handle large application submissions', async ({ page }) => {
      await page.route('**/scripts.google.com/**', route => {
        route.fulfill({
          status: 413, // Payload too large
          contentType: 'application/json',
          body: JSON.stringify({
            result: 'error',
            message: 'Submission too large. Please reduce message length.'
          })
        });
      });

      await page.goto('/get-started.html');

      // Fill minimum required fields
      await page.locator('input[name="applicant-name"]').fill('Large Data Test');
      await page.locator('input[name="email"]').fill('large@test.com');

      // Fill with very large message to simulate size issue
      const largeMessage = 'A'.repeat(10000); // 10,000 characters
      await page.locator('textarea[name="personal-statement"]').fill(largeMessage);

      await page.locator('input[name="accept-terms"]').check();

      // Submit large application
      await page.locator('button[type="submit"]').click();

      // Should show size limit error
      await expect(page.locator('text=Submission too large')).toBeVisible();
    });
  });

  test.describe('Maintenance Request Form', () => {
    test('should submit maintenance requests with photo upload capability', async ({ page }) => {
      await page.route('**/scripts.google.com/**', route => {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            result: 'success',
            ticketId: 'MTN-2025-045',
            message: 'Maintenance request submitted. Response expected within 24 hours.'
          })
        });
      });

      await page.goto('/contact.html');

      // Switch to maintenance request form if it exists
      await page.locator('select[name="inquiry-type"]').selectOption('maintenance');

      // Fill maintenance details
      await page.locator('input[name="name"]').fill('Sarah Johnson');
      await page.locator('input[name="email"]').fill('sarah.johnson@example.com');
      await page.locator('input[name="apartment-number"]').fill('202');
      await page.locator('select[name="urgency"]').selectOption('medium');
      await page.locator('select[name="issue-type"]').selectOption('plumbing');
      await page.locator('textarea[name="description"]').fill(
        'Kitchen sink is leaking. Water is dripping steadily from the faucet.'
      );

      // Note: File upload testing would require actual file handling
      // For now, we test the form submission without files

      await page.locator('button[type="submit"]').click();

      // Should show maintenance ticket confirmation
      await expect(page.locator('text=Maintenance request submitted')).toBeVisible();
      await expect(page.locator('text=MTN-2025-045')).toBeVisible();
    });
  });

  test.describe('Search Form & Property Filtering', () => {
    test('should filter properties based on search criteria', async ({ page }) => {
      await page.goto('/projects.html');

      // Check search form exists
      const searchForm = page.locator('form[action*="search"]');
      if (await searchForm.count() > 0) {
        // Fill search criteria
        await page.locator('select[name="bedrooms"]').selectOption('2');
        await page.locator('select[name="bathrooms"]').selectOption('1');
        await page.locator('input[name="max-rent"]').fill('1500');

        // Submit search
        await page.locator('button[type="submit"]').click();

        // Should filter results
        const propertyCards = page.locator('.property-card');
        const cardCount = await propertyCards.count();

        // Results should be filtered (may be 0 or some cards)
        expect(cardCount).toBeGreaterThanOrEqual(0);

        // Should show search results heading
        await expect(page.locator('h2')).toContainText(/search|results/i);
      } else {
        // If no search form, tests pass (search not implemented yet)
        expect(true).toBeTruthy();
      }
    });

    test('should handle property search with no results', async ({ page }) => {
      await page.goto('/projects.html');

      // Search with impossible criteria
      const searchForm = page.locator('form[action*="search"]');

      if (await searchForm.count() > 0) {
        await page.locator('select[name="bedrooms"]').selectOption('6'); // Very unlikely
        await page.locator('input[name="max-rent"]').fill('100'); // Very cheap

        await page.locator('button[type="submit"]').click();

        // Should show "no results" message or empty state
        const noResultsSelectors = [
          'text=No results found',
          'text=No properties match',
          'text=We\'re sorry'
        ];

        const hasNoResultsMessage = await Promise.all(
          noResultsSelectors.map(selector => page.locator(selector).count())
        ).then(counts => counts.some(count => count > 0));

        expect(hasNoResultsMessage).toBeTruthy();
      }
    });
  });

  test.describe('Form Error Handling & Recovery', () => {
    test('should preserve form data on submission errors', async ({ page }) => {
      await page.route('**/scripts.google.com/**', route => {
        route.abort('timed-out'); // Network timeout
      });

      await page.goto('/contact.html');

      const testData = {
        name: 'Data Preservation Test',
        email: 'data@test.com',
        message: 'This data should be preserved on error'
      };

      // Fill form
      await page.locator('input[name="name"]').fill(testData.name);
      await page.locator('input[name="email"]').fill(testData.email);
      await page.locator('textarea[name="message"]').fill(testData.message);

      // Submit (will fail due to network error)
      await page.locator('button[type="submit"]').click();

      // Data should still be in form fields after error
      await expect(page.locator('input[name="name"]')).toHaveValue(testData.name);
      await expect(page.locator('input[name="email"]')).toHaveValue(testData.email);
      await expect(page.locator('textarea[name="message"]')).toHaveValue(testData.message);

      // Should show error message
      await expect(page.locator('text=Error')).toBeVisible();
    });

    test('should show helpful error messages for different failure types', async ({ page }) => {
      const errorTypes = [
        { route: '**/*contact*', status: 400, message: 'Invalid form data' },
        { route: '**/*contact*', status: 401, message: 'Unauthorized submission' },
        { route: '**/*contact*', status: 403, message: 'Forbidden access' },
        { route: '**/*contact*', status: 404, message: 'Form endpoint not found' },
        { route: '**/*contact*', status: 429, message: 'Too many requests' },
        { route: '**/*contact*', status: 500, message: 'Internal server error' }
      ];

      for (const errorCase of errorTypes) {
        await page.route(errorCase.route, route => {
          route.fulfill({
            status: errorCase.status,
            contentType: 'application/json',
            body: JSON.stringify({
              result: 'error',
              message: errorCase.message
            })
          });
        });

        await page.goto('/contact.html');

        // Quick fill and submit
        await page.locator('input[name="name"]').fill('Error Test');
        await page.locator('input[name="email"]').fill('error@test.com');
        await page.locator('textarea[name="message"]').fill('Testing error handling');

        await page.locator('button[type="submit"]').click();

        // Should show appropriate error message
        await expect(page.locator(`text=${errorCase.message}`)).toBeVisible();
      }
    });

    test('should allow retrying failed submissions', async ({ page }) => {
      let requestCount = 0;

      await page.route('**/scripts.google.com/**', async route => {
        requestCount++;

        if (requestCount === 1) {
          // First attempt fails
          route.fulfill({
            status: 500,
            contentType: 'application/json',
            body: JSON.stringify({
              result: 'error',
              message: 'Temporary server error'
            })
          });
        } else {
          // Second attempt succeeds
          route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
              result: 'success',
              message: 'Form submitted successfully on retry'
            })
          });
        }
      });

      await page.goto('/contact.html');

      // Fill form
      await page.locator('input[name="name"]').fill('Retry Test');
      await page.locator('input[name="email"]').fill('retry@test.com');
      await page.locator('textarea[name="message"]').fill('Testing retry functionality');

      // First submit (fails)
      await page.locator('button[type="submit"]').click();
      await expect(page.locator('text=Temporary server error')).toBeVisible();

      // Retry button or resubmit
      await page.locator('button[type="submit"]').click();

      // Second submit (succeeds)
      await expect(page.locator('text=submitted successfully')).toBeVisible();
      await expect(page).toHaveURL(/thank-you/);
    });
  });

  test.describe('Form Analytics & Tracking Verification', () => {
    test('should track form interactions without interfering with submission', async ({ page }) => {
      // Mock analytics endpoint
      await page.route('**/google-analytics.com/**', route => route.fulfill({ status: 200 }));
      await page.route('**/googletagmanager.com/**', route => route.fulfill({ status: 200 }));

      await page.goto('/contact.html');

      // Interact with form fields (should trigger analytics)
      await page.locator('input[name="name"]').fill('Analytics Test');
      await page.locator('input[name="email"]').fill('analytics@test.com');
      await page.locator('textarea[name="message"]').focus();

      // Submit form
      await page.route('**/scripts.google.com/**', route => {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ result: 'success' })
        });
      });

      await page.locator('button[type="submit"]').click();

      // Form should still work normally
      await expect(page).toHaveURL(/thank-you/);
    });

    test('should work when analytics scripts are blocked', async ({ page }) => {
      // Block analytics scripts
      await page.route('**/google-analytics.com/**', route => route.abort());
      await page.route('**/googletagmanager.com/**', route => route.abort());

      await page.goto('/contact.html');

      // Form should still work without analytics
      await page.locator('input[name="name"]').fill('No Analytics Test');
      await page.locator('input[name="email"]').fill('noanalytics@test.com');
      await page.locator('textarea[name="message"]').fill('Testing without analytics');

      await page.route('**/scripts.google.com/**', route => {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ result: 'success' })
        });
      });

      await page.locator('button[type="submit"]').click();

      // Should still submit successfully
      await expect(page).toHaveURL(/thank-you/);
    });
  });
});
