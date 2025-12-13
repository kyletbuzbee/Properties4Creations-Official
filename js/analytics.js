/**
 * P4C Analytics - Business Revenue Tracking
 * Google Analytics 4 implementation for veterans & families housing
 */

(function() {
  'use strict';

  // Google Analytics Measurement ID - REPLACE WITH YOUR GA4 ID
  const GA_MEASUREMENT_ID = 'G-XXXXXXXXXX';

  // Initialize Google Analytics
  function initGoogleAnalytics() {
    // Only run on production and not localhost
    if (typeof window === 'undefined' ||
        window.location.hostname === 'localhost' ||
        window.location.hostname === '127.0.0.1') {
      console.log('GA: Skipping Google Analytics (development environment)');
      return;
    }

    // Load Google Analytics script
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
    document.head.appendChild(script);

    // Initialize gtag
    /* global dataLayer */
    window.dataLayer = window.dataLayer || [];
    function gtag(){
      // eslint-disable-next-line no-undef
      dataLayer.push(arguments);
    }
    window.gtag = gtag;
    gtag('js', new Date());
    gtag('config', GA_MEASUREMENT_ID, {
      // Custom configurations for veterans & families housing
      custom_map: {
        'dimension1': 'property_type',
        'dimension2': 'applicant_type', // veteran, family, general
        'dimension3': 'housing_budget'
      },
      custom_settings: {
        // Track all housing applicant types
        'send_page_view': true,
        'allow_google_signals': true,
        'allow_ad_features': true
      }
    });

    console.log('GA: Google Analytics initialized for veterans & families housing');
  }

  // Track property views (crucial for revenue optimization)
  function trackPropertyView(propertyId, propertyData) {
    if (!window.gtag) return;

    gtag('event', 'property_view', {
      property_id: propertyId,
      property_location: propertyData.location,
      property_price: propertyData.price.amount,
      property_type: propertyData.type,
      section8_eligible: propertyData.tags.includes('Section 8 Ready'),
      veteran_focused: propertyData.trust_badges.includes('Veteran-Owned'),
      page_location: window.location.pathname
    });
  }

  // Track lead generation (highest value events) - Veterans & Families
  function trackLeadGeneration(formType, propertyId, applicantType, leadValue = 0) {
    if (!window.gtag) return;

    // Calculate estimated lead value based on applicant type
    // Business model: Families (65%), Veterans (25%), General (10%)
    let baseValue = leadValue || 600; // Default family/general value
    let applicantCategory = 'family'; // Default to families

    if (applicantType === 'veteran') {
      baseValue = leadValue || 800; // Higher lifetime value for veterans
      applicantCategory = 'veteran';
    } else if (applicantType === 'general') {
      baseValue = leadValue || 500; // Lower value for general inquiries
      applicantCategory = 'general';
    }

    gtag('event', 'generate_lead', {
      event_category: 'conversion',
      event_label: propertyId,
      value: baseValue,
      currency: 'USD',
      form_type: formType,
      applicant_type: applicantCategory,
      lead_source: 'website_direct'
    });

    // E-commerce style tracking for lead attribution
    gtag('event', 'add_to_cart', {
      items: [{
        item_id: propertyId,
        item_name: `${propertyId} - ${applicantCategory} Application`,
        category: 'Housing_Applications',
        quantity: 1,
        price: baseValue,
        currency: 'USD'
      }],
      value: baseValue,
      currency: 'USD'
    });
  }

  // Track veteran-specific interactions
  function trackVeteranEngagement(action, propertyId, details) {
    if (!window.gtag) return;

    gtag('event', 'veteran_engagement', {
      event_category: 'veteran_services',
      event_label: `${action}_${propertyId}`,
      property_id: propertyId,
      engagement_type: action,
      details: details
    });
  }

  // Track conversion funnel progress
  function trackConversionStep(step, propertyId, veteranStatus) {
    if (!window.gtag) return;

    const value = veteranStatus ? 200 : 150; // Higher value for veterans

    gtag('event', 'conversion_funnel', {
      event_category: 'funnel',
      event_label: `${step}_${propertyId}`,
      funnel_step: step,
      property_id: propertyId,
      is_veteran: veteranStatus,
      value: value
    });
  }

  // Track property search and filtering
  function trackSearch(query, filters, resultsCount) {
    if (!window.gtag) return;

    gtag('event', 'search', {
      search_term: query,
      custom_parameters: {
        filters_applied: JSON.stringify(filters),
        results_found: resultsCount,
        veteran_friendly: filters.includes('veteran') || filters.includes('section8')
      }
    });
  }

  // Track map interactions (local SEO important)
  function trackMapInteraction(action, location, propertyId = null) {
    if (!window.gtag) return;

    gtag('event', 'map_interaction', {
      event_category: 'local_seo',
      event_label: `${action}_${location}`,
      location: location,
      property_id: propertyId,
      interaction_type: action
    });
  }

  // Business impact tracking (for dashboard KPIs)
  function trackBusinessMetric(metric, value, currency = 'USD') {
    if (!window.gtag) return;

    gtag('event', 'business_impact', {
      event_category: 'business_metrics',
      event_label: metric,
      value: value,
      currency: currency,
      metric_type: metric
    });
  }

  // Public API
  window.P4CAnalytics = {
    init: initGoogleAnalytics,
    trackPropertyView: trackPropertyView,
    trackLeadGeneration: trackLeadGeneration,
    trackVeteranEngagement: trackVeteranEngagement,
    trackConversionStep: trackConversionStep,
    trackSearchQuery: trackSearch,
    trackMapInteraction: trackMapInteraction,
    trackBusinessMetric: trackBusinessMetric
  };

  // Auto-initialize on page load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initGoogleAnalytics);
  } else {
    initGoogleAnalytics();
  }

})();
