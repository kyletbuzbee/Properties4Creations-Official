#!/usr/bin/env node

/**
 * Remove Inline Styles - Properties 4 Creations
 * Automated script to replace inline styles with CSS classes
 *
 * Usage: node scripts/remove-inline-styles.js
 */

const fs = require('fs');
const path = require('path');

// Configuration
const config = {
  htmlFiles: [
    'index.html',
    'projects.html',
    'contact.html',
    'transparency.html',
    'get-started.html',
    'about.html',
    'impact.html',
    'faq.html',
    'resources.html',
    'privacy.html',
    'thank-you.html',
    '404.html'
  ],
  backupDir: './backup-before-inline-removal',

  // Define replacements (order matters - most specific first)
  replacements: [
    // ========================================
    // BACKGROUND IMAGES
    // ========================================
    {
      find: /style="background-image:\s*url\(public\/images\/hero\/frontporchhero\.webp\)"/gi,
      replace: 'class="hero-bg-frontporch"',
      description: 'Hero background - frontporch'
    },
    {
      find: /style="background-image:\s*url\(public\/images\/properties\/before-after\/projects-kitchen-before\.webp\)"/gi,
      replace: 'class="comparison-bg-kitchen-before"',
      description: 'Kitchen before comparison'
    },
    {
      find: /style="background-image:\s*url\(public\/images\/properties\/before-after\/projects\/after\/kitchen\.webp\)"/gi,
      replace: 'class="comparison-bg-kitchen-after"',
      description: 'Kitchen after comparison'
    },
    {
      find: /style="background-image:\s*url\(public\/images\/properties\/before-after\/projects-before-living-room\.webp\)"/gi,
      replace: 'class="comparison-bg-living-before"',
      description: 'Living room before comparison'
    },
    {
      find: /style="background-image:\s*url\(public\/images\/properties\/before-after\/after\/livingroom\.webp\)"/gi,
      replace: 'class="comparison-bg-living-after"',
      description: 'Living room after comparison'
    },

    // ========================================
    // OPACITY & TRANSPARENCY
    // ========================================
    {
      find: /(<img[^>]+)style="opacity:\s*0\.20?"/gi,
      replace: '$1class="hero-bg-overlay"',
      description: 'Hero image overlay opacity'
    },

    // ========================================
    // TRANSFORMS (Non-dynamic)
    // ========================================
    {
      find: /style="transform:\s*rotate\(1deg\)"/gi,
      replace: 'class="rotate-1"',
      description: 'Rotate 1 degree'
    },

    // ========================================
    // WORD-WRAP
    // ========================================
    {
      find: /style="word-wrap:\s*break-word\.?"/gi,
      replace: 'class="word-wrap-break"',
      description: 'Word wrap break-word'
    },

    // ========================================
    // Z-INDEX (Static only)
    // ========================================
    {
      find: /style="z-index:\s*1000\.?"/gi,
      replace: 'class="z-1000"',
      description: 'Z-index 1000'
    },

    // ========================================
    // TAB SIZE
    // ========================================
    {
      find: /<style type="text\/css">\s*:root\s*{\s*--tab-size-preference:\s*4;\s*}\s*pre,\s*code\s*{\s*tab-size:\s*var\(--tab-size-preference\);\s*}\s*<\/style>/gi,
      replace: '<!-- Tab size handled in external CSS -->',
      description: 'Tab size inline style block'
    }
  ]
};

// Create backup directory
function createBackup() {
  if (!fs.existsSync(config.backupDir)) {
    fs.mkdirSync(config.backupDir, { recursive: true });
    console.log(`✅ Created backup directory: ${config.backupDir}`);
  }
}

// Backup a file
function backupFile(filePath) {
  const backupPath = path.join(config.backupDir, path.basename(filePath));
  fs.copyFileSync(filePath, backupPath);
  console.log(`📦 Backed up: ${filePath} → ${backupPath}`);
}

// Process a single HTML file
function processFile(filePath) {
  console.log(`\n📄 Processing: ${filePath}`);

  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  File not found, skipping: ${filePath}`);
    return;
  }

  // Backup first
  backupFile(filePath);

  // Read file
  let content = fs.readFileSync(filePath, 'utf8');
  let changesCount = 0;

  // Apply replacements
  config.replacements.forEach((replacement) => {
    const before = content;
    content = content.replace(replacement.find, replacement.replace);

    if (content !== before) {
      changesCount++;
      console.log(`  ✓ ${replacement.description}`);
    }
  });

  // Write back
  if (changesCount > 0) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Saved with ${changesCount} change(s)`);
  } else {
    console.log(`ℹ️  No changes needed`);
  }
}

// Main execution
function main() {
  console.log('🚀 Starting inline style removal...\n');

  createBackup();

  let totalFiles = 0;
  config.htmlFiles.forEach((file) => {
    processFile(file);
    totalFiles++;
  });

  console.log(`\n✅ Complete! Processed ${totalFiles} file(s)`);
  console.log(`📦 Backups saved to: ${config.backupDir}`);
  console.log('\n⚠️  IMPORTANT NEXT STEPS:');
  console.log('1. Verify changes visually in browser');
  console.log('2. Test all interactive elements (sliders, menus)');
  console.log('3. Check mobile responsive behavior');
  console.log('4. If everything works, commit changes');
  console.log('5. If issues found, restore from backup/');
}

// Run script
main();
