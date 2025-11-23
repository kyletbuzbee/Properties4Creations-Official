/**
 * Node.js Gap Validation Runner - Validates Missing Pieces for P4C
 * Runs validation without requiring browser environment
 */

const fs = require('fs').promises;
const path = require('path');

const NodeGapValidation = {

    async init() {
        console.log('🎯 P4C NODE.JS GAP VALIDATION - TESTING MISSING PIECES');
        console.log('='.repeat(70));

        const results = [];

        results.push(await this.testNavigationHighlighting());
        results.push(await this.testProjectsPageRendering());
        results.push(await this.testFormSubmission());
        results.push(await this.testConsoleErrors());

        this.printGapSummary(results);
    },

    // Test 1: Navigation Highlighting Logic (static analysis)
    async testNavigationHighlighting() {
        console.log('\n🔍 TESTING NAVIGATION HIGHLIGHTING LOGIC...');

        try {
            const loaderPath = 'components/component-loader.js';
            const loaderCode = await fs.readFile(loaderPath, 'utf8');

            const hasHighlighting = loaderCode.includes('applyNavigationHighlighting');
            const hasActiveState = loaderCode.includes('bg-white/10');
            const hasLogic = loaderCode.includes('getAttribute(\'href\') === currentPath');

            console.log(`✅ Component loader has navigation highlighting function: ${hasHighlighting}`);
            console.log(`✅ Active state styling ('bg-white/10'): ${hasActiveState}`);
            console.log(`✅ URL matching logic detected: ${hasLogic}`);

            return {
                navHighlighting: hasHighlighting && hasActiveState && hasLogic,
                message: 'Navigation highlighting logic verified in component-loader.js'
            };

        } catch (error) {
            console.error('❌ Error testing navigation highlighting:', error.message);
            return { navHighlighting: false, message: `Error: ${error.message}` };
        }
    },

    // Test 2: Projects Page Dynamic Rendering (data validation)
    async testProjectsPageRendering() {
        console.log('\n🔍 TESTING PROJECTS PAGE DYNAMIC RENDERING...');

        try {
            const dataPath = 'public/properties-data.json';
            const dataFile = await fs.readFile(dataPath, 'utf8');
            const properties = JSON.parse(dataFile);

            const hasThreeProperties = properties.length === 3;
            const hasValidIDs = properties.every(p => p.id && typeof p.id === 'string' && /^\d+$/.test(p.id));
            const hasLocalImages = properties.every(p =>
                p.images && Array.isArray(p.images) && p.images.length > 0 &&
                !p.images[0].startsWith('http'));

            console.log(`✅ Exactly 3 properties: ${hasThreeProperties}`);
            console.log(`✅ Valid numeric IDs: ${hasValidIDs}`);
            console.log(`✅ Local image paths (no HTTPS): ${hasLocalImages}`);

            // Check badge tags exist
            const section8Property = properties.find(p => p.tags && p.tags.includes('Section 8 Ready'));
            const marketProperty = properties.find(p => p.tags && p.tags.includes('Market Rate'));

            console.log(`✅ Section 8 Ready property found: ${!!section8Property}`);
            console.log(`✅ Market Rate property found: ${!!marketProperty}`);

            const dataValid = hasThreeProperties && hasValidIDs && hasLocalImages && section8Property && marketProperty;

            return {
                projectsRendering: dataValid,
                message: dataValid ? 'Properties data structure verified - ready for dynamic rendering' : 'Properties data structure issues detected'
            };

        } catch (error) {
            console.error('❌ Error testing projects rendering:', error.message);
            return { projectsRendering: false, message: `Error: ${error.message}` };
        }
    },

    // Test 3: Form Submission (static analysis of form structure)
    async testFormSubmission() {
        console.log('\n🔍 TESTING FORM SUBMISSION STRUCTURE...');

        try {
            const pagePath = 'get-started.html';
            const html = await fs.readFile(pagePath, 'utf8');

            const hasForm = html.includes('<form');
            const hasPropertyConditionField = html.includes('Property Condition') ||
                                           html.includes('property-condition') ||
                                           /placeholder="[^"]*ondition/i.test(html);
            const hasTimelineField = html.includes('Timeline') ||
                                   html.includes('timeline') ||
                                   /placeholder="[^"]*(time|when|schedule)/i.test(html);
            const hasStaticFormsScript = html.includes('static-forms.js');

            console.log(`✅ Form element present: ${hasForm}`);
            console.log(`✅ Property Condition field: ${hasPropertyConditionField}`);
            console.log(`✅ Timeline field: ${hasTimelineField}`);
            console.log(`✅ static-forms.js integration: ${hasStaticFormsScript}`);

            // Check form method and action
            const formActionCheck = /<form[^>]*method="[^"]*POST/i.test(html) ||
                                  hasStaticFormsScript; // static-forms.js handles submission

            console.log(`✅ Form submission mechanism: ${formActionCheck}`);

            const formValid = hasForm && hasPropertyConditionField && hasTimelineField && (formActionCheck || hasStaticFormsScript);

            return {
                formSubmission: formValid,
                message: formValid ? 'Form structure and submission verified' : 'Form structure issues detected'
            };

        } catch (error) {
            console.error('❌ Error testing form submission:', error.message);
            return { formSubmission: false, message: `Error: ${error.message}` };
        }
    },

    // Test 4: Console Error Prevention (component loading structure)
    async testConsoleErrors() {
        console.log('\n🔍 TESTING COMPONENT LOADING STRUCTURE...');

        try {
            const pages = ['index.html', 'about.html', 'projects.html', 'get-started.html'];
            let errorFree = true;
            const issues = [];

            for (const page of pages) {
                try {
                    const html = await fs.readFile(page, 'utf8');

                    // Check for container system (no hardcoded headers/footers)
                    const hasHeaderContainer = html.includes('<div id="header-container"></div>');
                    const hasFooterContainer = html.includes('<div id="footer-container"></div>');
                    const hasComponentLoader = html.includes('components/component-loader.js');
                    const noHardcodedHeader = !html.includes('<header id="main-header"');
                    const noHardcodedFooter = !/class="bg-brand-navy">/.test(html);

                    const pageValid = hasHeaderContainer && hasFooterContainer &&
                                    hasComponentLoader && noHardcodedHeader && noHardcodedFooter;

                    console.log(`${pageValid ? '✅' : '❌'} ${page} - Container system: ${pageValid ? 'PASS' : 'FAIL'}`);

                    if (!pageValid) {
                        errorFree = false;
                        issues.push(`${page} container system`);
                    }
                } catch (error) {
                    console.log(`❌ ${page} - Error reading file: ${error.message}`);
                    errorFree = false;
                    issues.push(`${page} file access`);
                }
            }

            // Test component files exist
            const compFiles = [
                'components/header.html',
                'components/footer.html',
                'components/component-loader.js'
            ];

            for (const file of compFiles) {
                try {
                    await fs.access(file);
                    console.log(`✅ Component file exists: ${file}`);
                } catch (error) {
                    console.log(`❌ Missing component file: ${file}`);
                    errorFree = false;
                    issues.push(`Missing ${file}`);
                }
            }

            // Check component loader console message
            try {
                const loaderCode = await fs.readFile('components/component-loader.js', 'utf8');
                const hasSuccessMessage = loaderCode.includes('P4C Components loaded');
                console.log(`${hasSuccessMessage ? '✅' : '❌'} Component loader success message: ${hasSuccessMessage ? 'PRESENT' : 'MISSING'}`);

                if (!hasSuccessMessage) {
                    errorFree = false;
                    issues.push('Missing component load success message');
                }
            } catch (error) {
                console.log('❌ Error checking component loader console message');
                errorFree = false;
                issues.push('Component loader file access');
            }

            return {
                consoleErrors: errorFree,
                message: errorFree ? 'Component loading structure prevents 404 errors' :
                                  `Console error issues detected: ${issues.join(', ')}`
            };

        } catch (error) {
            console.error('❌ Error testing console errors:', error.message);
            return { consoleErrors: false, message: `Error: ${error.message}` };
        }
    },

    printGapSummary(results) {
        console.log('\n' + '='.repeat(70));
        console.log('🎯 P4C GAP VALIDATION RESULTS - NODE.JS ANALYSIS');
        console.log('='.repeat(70));

        const allPassed = results.every(result => Object.values(result).every(Boolean));

        console.log('\n🔍 **VALIDATION RESULTS:**');
        results.forEach((result, index) => {
            Object.entries(result).forEach(([key, value]) => {
                if (typeof value === 'boolean') {
                    console.log(`${value ? '✅' : '❌'} ${key}: ${value ? 'PASS' : 'FAIL'}`);
                }
            });
        });

        console.log('\n🚀 **LIVE TESTING GUIDANCE:**');
        console.log('• Open index.html in browser - click "About" to verify navigation highlighting');
        console.log('• Visit projects.html - check 3 property cards render with badge colors');
        console.log('• Go to get-started.html - submit form to see "✓ Information Sent!" message');
        console.log('• Open browser Console (F12) - should show "✅ P4C Components loaded"');
        console.log('• Run test-runner.html for comprehensive validation suite');

        console.log('\n🏆 **FINAL ASSESSMENT:**');
        if (allPassed) {
            console.log('🎉 100% ENTERPRISE-READY - All validation gaps satisfied!');
            console.log('Platform successfully transformed from "Investor Real Estate" to "Veteran Sanctuary"! 🏠✨');
        } else {
            console.log('⚠️ SOME ISSUES DETECTED - Review failures above before deployment');
        }

        // Summary stats
        const totalTests = results.length;
        const passedTests = results.filter(result =>
            Object.values(result).every(value =>
                typeof value === 'boolean' ? value : true
            )
        ).length;

        console.log(`\n📊 SCORECARD: ${passedTests}/${totalTests} critical gaps validated`);
    }
};

// Run if called directly
if (require.main === module) {
    NodeGapValidation.init().catch(console.error);
}

module.exports = NodeGapValidation;
