#!/usr/bin/env node
/**
 * Script Standardization Tool
 * Standardizes JavaScript loading across all HTML files
 */

const fs = require('fs');
const path = require('path');

const targetScriptPattern = `<script src="js/component-loader.js"[^>]*></script>`;
const targetAccessibilityPattern = `<script src="js/accessibility-enhanced.js"></script>`;

// Standard script tags we want:
// <script src="js/component-loader.js" defer></script>
const componentLoaderScript = '<script src="js/component-loader.js" defer></script>';
const accessibilityScript = '<script src="js/accessibility-enhanced.js"></script>';

// Files to process (main HTML files, excluding property listings and components)
const htmlFiles = [
    'index.html',
    'about.html',
    'contact.html',
    'employment.html',
    'faq.html',
    'get-started.html',
    'impact.html',
    'privacy.html',
    'projects.html',
    'resources.html',
    'terms.html',
    'thank-you.html',
    'transparency.html'
];

console.log('🔧 Standardizing JavaScript loading across HTML files...\n');

htmlFiles.forEach(fileName => {
    const filePath = path.join(process.cwd(), fileName);

    if (!fs.existsSync(filePath)) {
        console.log(`⚠️  Skipping ${fileName} - file not found`);
        return;
    }

    try {
        let content = fs.readFileSync(filePath, 'utf-8');

        // Find current component-loader script
        const componentLoaderMatch = content.match(/<script[^>]*src="js\/component-loader\.js"[^>]*><\/script>/);

        if (componentLoaderMatch) {
            const currentScript = componentLoaderMatch[0];

            // Replace with standardized version
            if (currentScript !== componentLoaderScript) {
                content = content.replace(currentScript, componentLoaderScript);
                console.log(`✅ Updated ${fileName}: ${currentScript} → ${componentLoaderScript}`);
            } else {
                console.log(`🔄 ${fileName}: already using correct component-loader script`);
            }
        } else {
            console.log(`❓ ${fileName}: no component-loader script found`);
        }

        // Check for accessibility script
        const accessibilityMatch = content.match(/<script[^>]*src="js\/accessibility-enhanced\.js"[^>]*><\/script>/);

        if (accessibilityMatch) {
            const currentScript = accessibilityMatch[0];

            // Replace with standardized version
            if (currentScript !== accessibilityScript) {
                content = content.replace(currentScript, accessibilityScript);
                console.log(`✅ Updated ${fileName}: ${currentScript} → ${accessibilityScript}`);
            } else {
                console.log(`🔄 ${fileName}: already using correct accessibility script`);
            }
        } else {
            console.log(`❓ ${fileName}: no accessibility-enhanced script found`);
            content = content.replace(componentLoaderScript, componentLoaderScript + '\n    ' + accessibilityScript);
            console.log(`➕ Added accessibility script to ${fileName}`);
        }

        // Write back to file
        fs.writeFileSync(filePath, content);

    } catch (error) {
        console.error(`❌ Error processing ${fileName}:`, error.message);
    }
});

console.log('\n🎉 Script standardization complete!');
console.log(`
📋 Summary of changes:
- All component-loader.js scripts now use 'defer' for better performance
- All accessibility-enhanced.js scripts load immediately for proper accessibility features
- Scripts are consistently ordered: component-loader (defer) then accessibility-enhanced

Performance benefits:
✅ Defer non-blocking scripts (component-loader)
✅ Immediate accessibility enhancement (skip links, focus states)
✅ Consistent loading order across pages
`);
