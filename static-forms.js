/**
 * P4C Static Forms Handler
 * Handles form submission, validation, and basic interactivity
 */

(function() {
  'use strict';

  // Form validation and submission handler
  window.P4CForms = {

    /**
     * Initialize all forms on the page
     */
    init: function() {
      console.log('🚀 Initializing P4C Forms...');

      // Get all forms on the page
      const forms = document.querySelectorAll('form');

      forms.forEach(form => {
        this.setupForm(form);
      });

      // Handle form submissions
      document.addEventListener('submit', this.handleSubmit.bind(this));
    },

    /**
     * Set up individual form
     */
    setupForm: function(form) {
      // Add input validation
      const inputs = form.querySelectorAll('input, textarea, select');

      inputs.forEach(input => {
        // Real-time validation
        input.addEventListener('blur', () => this.validateField(input));
        input.addEventListener('input', () => this.clearFieldError(input));
      });

      // Form validation on submit
      form.addEventListener('submit', (e) => {
        if (!this.validateForm(form)) {
          e.preventDefault();
          return false;
        }
      });
    },

    /**
     * Handle form submission
     */
    handleSubmit: function(e) {
      const form = e.target;

      // Only handle P4C forms
      if (!form.closest('.p4c-form, form')) return;

      e.preventDefault();

      if (!this.validateForm(form)) {
        return false;
      }

      // Show loading state
      this.setFormLoading(form, true);

      // Prepare form data
      const formData = new FormData(form);
      const data = Object.fromEntries(formData.entries());

      // Add additional data
      data.timestamp = new Date().toISOString();
      data.page = window.location.pathname;

      // Simulate form submission (replace with actual endpoint)
      console.log('📤 Form submission data:', data);

      // For now, just show success and redirect
      setTimeout(() => {
        this.handleSubmissionSuccess(form, data);
      }, 1500);
    },

    /**
     * Validate entire form
     */
    validateForm: function(form) {
      const inputs = form.querySelectorAll('input[required], textarea[required], select[required]');
      let isValid = true;

      inputs.forEach(input => {
        if (!this.validateField(input)) {
          isValid = false;
        }
      });

      return isValid;
    },

    /**
     * Validate individual field
     */
    validateField: function(field) {
      const value = field.value.trim();
      const type = field.type;
      let isValid = true;
      let errorMessage = '';

      // Clear previous errors
      this.clearFieldError(field);

      // Required field check
      if (field.required && !value) {
        errorMessage = `${field.name} is required`;
        isValid = false;
      }

      // Email validation
      else if (type === 'email' && value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
          errorMessage = 'Please enter a valid email address';
          isValid = false;
        }
      }

      // Phone validation
      else if (type === 'tel' && value) {
        const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
        if (!phoneRegex.test(value.replace(/[\s\-\(\)]/g, ''))) {
          errorMessage = 'Please enter a valid phone number';
          isValid = false;
        }
      }

      // Show error if invalid
      if (!isValid) {
        this.showFieldError(field, errorMessage);
      }

      return isValid;
    },

    /**
     * Show field error
     */
    showFieldError: function(field, message) {
      field.classList.add('error');

      // Create error message element
      const errorEl = document.createElement('div');
      errorEl.className = 'error-message';
      errorEl.textContent = message;

      field.parentNode.insertBefore(errorEl, field.nextSibling);
    },

    /**
     * Clear field error
     */
    clearFieldError: function(field) {
      field.classList.remove('error');

      const errorEl = field.parentNode.querySelector('.error-message');
      if (errorEl) {
        errorEl.remove();
      }
    },

    /**
     * Set form loading state
     */
    setFormLoading: function(form, isLoading) {
      const submitBtn = form.querySelector('button[type="submit"]');

      if (submitBtn) {
        submitBtn.disabled = isLoading;
        submitBtn.textContent = isLoading ?
          'Submitting...' :
          submitBtn.textContent.replace('Submitting...', submitBtn.getAttribute('data-original-text') || 'Submit');

        if (!submitBtn.getAttribute('data-original-text')) {
          submitBtn.setAttribute('data-original-text', submitBtn.textContent);
        }
      }

      // Disable all inputs
      const inputs = form.querySelectorAll('input, textarea, select, button');
      inputs.forEach(input => {
        input.disabled = isLoading;
      });
    },

    /**
     * Handle successful submission
     */
    handleSubmissionSuccess: function(form, data) {
      console.log('✅ Form submitted successfully');

      // Reset form
      this.setFormLoading(form, false);
      form.reset();

      // Find redirect URL
      const redirectInput = form.querySelector('input[name="_next"]');
      const redirectUrl = redirectInput ? redirectInput.value : 'thank-you.html';

      // Show success message
      this.showSuccessMessage(form);

      // Redirect after delay
      setTimeout(() => {
        window.location.href = redirectUrl;
      }, 2000);
    },

    /**
     * Show success message
     */
    showSuccessMessage: function(form) {
      const successEl = document.createElement('div');
      successEl.className = 'success-message p-4 bg-green-100 text-green-800 rounded-lg mt-4';
      successEl.textContent = 'Thank you! Your message has been sent successfully.';

      form.appendChild(successEl);

      // Remove after 3 seconds
      setTimeout(() => {
        if (successEl.parentNode) {
          successEl.remove();
        }
      }, 3000);
    }
  };

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', window.P4CForms.init.bind(window.P4CForms));
  } else {
    window.P4CForms.init();
  }

})();
