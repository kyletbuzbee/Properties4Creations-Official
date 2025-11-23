/**
 * P4C Enterprise Funnel Validation Tests
 * Tests all critical pages for functionality, accessibility, and compliance
 */

// P4C Validation Test Suite
const P4CValidation = {
    // Test results storage
    results: {
        passed: 0,
        failed: 0,
        warnings: 0,
        tests: []
    },

    // Helper function to log test results
    logTest(testName, status, message = '', details = {}) {
        const result = {
            testName,
            status,
            message,
            details,
            timestamp: new Date().toISOString()
        };

        this.results.tests.push(result);

        if (status === 'pass') {
            this.results.passed++;
            console.log(`✅ ${testName}`);
        } else if (status === 'fail') {
            this.results.failed++;
            console.error(`❌ ${testName}: ${message}`);
        } else if (status === 'warn') {
            this.results.warnings++;
            console.warn(`⚠️ ${testName}: ${message}`);
        }

        return result;
    },

    // Test page structure compliance
    testPageStructure(pageName, doc) {
        // Test header container
        const headerContainer = doc.getElementById('header-container');
        this.logTest(
            `${pageName} - Header Container`,
            headerContainer ? 'pass' : 'fail',
            headerContainer ? '' : 'Missing required header-container div'
        );

        // Test footer container
        const footerContainer = doc.getElementById('footer-container');
        this.logTest(
            `${pageName} - Footer Container`,
            footerContainer ? 'pass' : 'fail',
            footerContainer ? '' : 'Missing required footer-container div'
        );

        // Test component loader script
        const componentLoader = doc.querySelector('script[src="components/component-loader.js"]');
        this.logTest(
            `${pageName} - Component Loader`,
            componentLoader ? 'pass' : 'fail',
            componentLoader ? '' : 'Missing component-loader.js script'
        );

        // Test design tokens CSS
        const designTokens = doc.querySelector('link[href="css/design-tokens.css"]');
        this.logTest(
            `${pageName} - Design Tokens`,
            designTokens ? 'pass' : 'fail',
            designTokens ? '' : 'Missing css/design-tokens.css link'
        );

        // Test main semantic structure
        const main = doc.querySelector('main');
        this.logTest(
            `${pageName} - Main Element`,
            main ? 'pass' : 'fail',
            main ? '' : 'Missing semantic main element'
        );
    },

    // Test accessibility compliance
    testAccessibility(pageName, doc) {
        // Test alt text on images
        const images = doc.querySelectorAll('img');
        let imagesWithoutAlt = 0;
        images.forEach(img => {
            if (!img.getAttribute('alt') || img.getAttribute('alt').trim() === '') {
                imagesWithoutAlt++;
            }
        });

        this.logTest(
            `${pageName} - Image Alt Text`,
            imagesWithoutAlt === 0 ? 'pass' : 'fail',
            imagesWithoutAlt === 0 ? '' : `${imagesWithoutAlt} images missing alt text`
        );

        // Test focus-visible states (check if design-tokens has focus styles)
        // This would require CSS analysis which is complex in vanilla JS
        this.logTest(
            `${pageName} - Focus Styles`,
            'warn',
            'Focus-visible styles require CSS inspection - manually verify design-tokens.css'
        );

        // Test semantic HTML
        const headings = doc.querySelectorAll('h1, h2, h3, h4, h5, h6');
        this.logTest(
            `${pageName} - Semantic Headings`,
            headings.length > 0 ? 'pass' : 'warn',
            headings.length > 0 ? `${headings.length} headings found` : 'No headings found'
        );

        // Test ARIA labels on interactive elements
        const buttons = doc.querySelectorAll('button[aria-label]');
        const totalButtons = doc.querySelectorAll('button');
        this.logTest(
            `${pageName} - ARIA Labels`,
            'warn',
            `${buttons.length} buttons have aria-label out of ${totalButtons.length} total buttons`
        );
    },

    // Test page-specific functionality
    testPageSpecific(pageName, doc) {
        switch (pageName) {
            case 'get-started.html':
                // Test impact form
                const form = doc.querySelector('form');
                this.logTest(
                    'get-started.html - Impact Form',
                    form ? 'pass' : 'fail',
                    form ? 'Contact form present' : 'Missing contact form'
                );

                // Test form validation
                const requiredInputs = form ? form.querySelectorAll('input[required], textarea[required]') : [];
                this.logTest(
                    'get-started.html - Form Validation',
                    requiredInputs.length > 0 ? 'pass' : 'warn',
                    `${requiredInputs.length} required fields found`
                );

                // Test impact flow visualization
                const flowNodes = doc.querySelectorAll('.flow-node');
                this.logTest(
                    'get-started.html - Impact Flow Visualization',
                    flowNodes.length >= 4 ? 'pass' : 'fail',
                    `${flowNodes.length} flow nodes found (expected 4+)`
                );
                break;

            case 'about.html':
                // Test Chain of Good section
                const chainSection = doc.querySelector('[data-section="chain-of-good"]') ||
                                   doc.querySelector('h2:contains("Chain of Good")')?.closest('section') ||
                                   doc.querySelector('.chain-of-good');

                this.logTest(
                    'about.html - Chain of Good Section',
                    chainSection ? 'pass' : 'fail',
                    chainSection ? 'Chain of Good visualization present' : 'Missing Chain of Good section'
                );

                // Test impact multipliers
                const impactMultipliers = doc.querySelectorAll('[class*="impact-multiplier"], [class*="multipliers"]');
                this.logTest(
                    'about.html - Impact Multipliers',
                    impactMultipliers.length >= 3 ? 'pass' : 'warn',
                    `${impactMultipliers.length} impact multiplier items found`
                );
                break;

            case 'transparency.html':
                // Test renovation standards
                const standards = doc.querySelectorAll('.standard-item, [class*="standard"]');
                this.logTest(
                    'transparency.html - Renovation Standards',
                    standards.length >= 4 ? 'pass' : 'fail',
                    `${standards.length} renovation standards found (expected 4: HVAC, Roof, Electrical, Plumbing)`
                );

                // Test trust signals
                const trustSignals = doc.querySelectorAll('.trust-signal, [class*="trust"]');
                this.logTest(
                    'transparency.html - Trust Signals',
                    trustSignals.length >= 4 ? 'pass' : 'fail',
                    `${trustSignals.length} trust signals found`
                );

                // Test Section 8 compliance status
                const statusIndicator = doc.querySelector('[class*="status"], [class*="compliance"]');
                this.logTest(
                    'transparency.html - Section 8 Status',
                    'warn',
                    'Verify Section 8 approved status display manually'
                );
                break;

            default:
                this.logTest(
                    `${pageName} - Page Specific Tests`,
                    'warn',
                    `No specific tests defined for ${pageName}`
                );
        }
    },

    // Test data integrity with properties-data.json
    async testDataIntegrity(pageName, doc) {
        try {
            const response = await fetch('public/properties-data.json');
            if (!response.ok) {
                this.logTest(`${pageName} - Properties Data`, 'fail', 'Cannot fetch properties-data.json');
                return;
            }

            const data = await response.json();
            const validProperties = data.filter(prop =>
                prop.id && prop.title && prop.location && prop.price
            );

            this.logTest(
                `${pageName} - Properties Data Integrity`,
                validProperties.length === data.length ? 'pass' : 'fail',
                `${validProperties.length}/${data.length} properties have valid structure`
            );
        } catch (error) {
            this.logTest(`${pageName} - Properties Data Fetch`, 'fail', `Error: ${error.message}`);
        }
    },

    // Test design system compliance
    testDesignSystem(pageName, doc) {
        // Test for custom CSS variables usage
        const computedStyles = getComputedStyle(doc.body);
        const hasBrandVars = computedStyles.getPropertyValue('--color-primary-navy') ||
                           computedStyles.getPropertyValue('--color-accent-gold');

        this.logTest(
            `${pageName} - Design Tokens Usage`,
            hasBrandVars ? 'pass' : 'warn',
            hasBrandVars ? 'Using CSS custom properties' : 'May not be using design tokens properly'
        );

        // Test Tailwind classes usage
        const tailwindClasses = ['bg-brand-navy', 'text-brand-wood', 'shadow-wood', 'font-heading'];
        let tailwindUsage = 0;
        tailwindClasses.forEach(cls => {
            if (doc.querySelector(`[class*="${cls}"]`)) {
                tailwindUsage++;
            }
        });

        this.logTest(
            `${pageName} - Tailwind Integration`,
            tailwindUsage >= 2 ? 'pass' : 'warn',
            `${tailwindUsage}/${tailwindClasses.length} design token classes detected`
        );
    },

    // Run all tests for a page
    async testPage(pageName, doc) {
        console.group(`🧪 Testing ${pageName}`);

        // Structure compliance
        this.testPageStructure(pageName, doc);

        // Accessibility
        this.testAccessibility(pageName, doc);

        // Page-specific functionality
        this.testPageSpecific(pageName, doc);

        // Design system compliance
        this.testDesignSystem(pageName, doc);

        // Data integrity (for relevant pages)
        if (['projects.html', 'index.html'].includes(pageName)) {
            await this.testDataIntegrity(pageName, doc);
        }

        console.groupEnd();
        return this.results;
    },

    // Run tests for all critical pages
    async runFullSuite() {
        console.log('🚀 Starting P4C Enterprise Funnel Validation Suite');
        console.log('='.repeat(60));

        const criticalPages = [
            'index.html',
            'get-started.html',
            'about.html',
            'transparency.html',
            'projects.html'
        ];

        // Reset results
        this.results = { passed: 0, failed: 0, warnings: 0, tests: [] };

        for (const pageName of criticalPages) {
            try {
                // Create iframe to load and test each page
                const iframe = document.createElement('iframe');
                iframe.style.display = 'none';
                document.body.appendChild(iframe);

                // Load page
                iframe.src = pageName;
                await new Promise(resolve => {
                    iframe.onload = () => {
                        setTimeout(resolve, 500); // Allow time for scripts to load
                    };
                });

                if (iframe.contentDocument) {
                    await this.testPage(pageName, iframe.contentDocument);
                } else {
                    this.logTest(pageName, 'fail', 'Could not access page content');
                }

                document.body.removeChild(iframe);
            } catch (error) {
                this.logTest(pageName, 'fail', `Page load error: ${error.message}`);
            }
        }

        // Print final summary
        this.printSummary();
    },

    // Print final test summary
    printSummary() {
        console.log('='.repeat(60));
        console.log('📊 VALIDATION SUMMARY');
        console.log('='.repeat(60));
        console.log(`✅ Passed: ${this.results.passed}`);
        console.log(`❌ Failed: ${this.results.failed}`);
        console.log(`⚠️ Warnings: ${this.results.warnings}`);
        console.log(`Total Tests: ${this.results.tests.length}`);

        const passRate = ((this.results.passed / this.results.tests.length) * 100).toFixed(1);
        console.log(`Pass Rate: ${passRate}%`);

        if (this.results.failed > 0) {
            console.log('\n🔧 FAILED TESTS:');
            this.results.tests
                .filter(test => test.status === 'fail')
                .forEach(test => console.log(`  - ${test.testName}: ${test.message}`));
        }

        // Determine overall health
        const overallHealth = this.results.failed === 0 ? 'HEALTHY' :
                            this.results.failed <= 5 ? 'NEEDS ATTENTION' : 'CRITICAL ISSUES';
        console.log(`\n🏥 OVERALL HEALTH: ${overallHealth}`);

        return this.results;
    }
};

// Auto-run validation if script is loaded directly
if (typeof window !== 'undefined') {
    window.P4CValidation = P4CValidation;

    // Run validation on page load if this is the current page
    document.addEventListener('DOMContentLoaded', function() {
        // Only run full suite if explicitly loaded for validation
        if (window.location.search.includes('validate=true') ||
            document.querySelector('script[src*="validation-test.js"]')) {
            setTimeout(() => {
                P4CValidation.runFullSuite();
            }, 1000);
        }
    });
}

// Export for Node.js testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = P4CValidation;
}
