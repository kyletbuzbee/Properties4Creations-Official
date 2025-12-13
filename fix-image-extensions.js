#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

function fixImageExtensions(dirPath, extensions = ['.html']) {
  // Get all files in directory recursively
  const files = fs.readdirSync(dirPath, { recursive: true });

  console.log(`Processing ${files.length} files...`);

  let processed = 0;
  let fixed = 0;

  for (const file of files) {
    const filePath = path.join(dirPath, file);

    // Only process specified file types
    if (!extensions.some(ext => file.endsWith(ext))) {
      continue;
    }

    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const original = content;

      // Replace .jpg with .webp
      const updated = content.replace(
        /\.jpg(?=\?|$|\.webp[^?]|\)|\}| |\n|<|>|'|")/g,
        '.webp'
      );

      if (original !== updated) {
        fs.writeFileSync(filePath, updated, 'utf8');
        fixed++;
        console.log(`Fixed: ${filePath}`);
      }

      processed++;

      // Progress indicator
      if (processed % 10 === 0) {
        console.log(`Processed ${processed} files, fixed ${fixed} files`);
      }

    } catch (error) {
      console.error(`Error processing ${filePath}:`, error.message);
    }
  }

  console.log(`\nComplete! Processed ${processed} files, fixed ${fixed} files.`);
}

if (require.main === module) {
  const targetDir = process.argv[2] || '.';
  console.log(`Fixing image extensions in: ${targetDir}`);
  fixImageExtensions(targetDir);
}

module.exports = { fixImageExtensions };
