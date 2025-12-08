# 🛑 CRITICAL ARCHITECTURE RULE: "WHAT YOU SEE IS WHAT YOU SERVE"
- **NO BUILD STEP:** This project does NOT use Webpack, Vite, or a `dist/` folder.
- **SOURCE OF TRUTH:** The HTML files in the root directory (e.g., `index.html`, `projects/*.html`) are the LIVE production code.
- **ACTION:** When asked to "fix" or "update" the site, edit these root files directly. Do not try to compile, build, or deploy.
- **INJECTION:** Shared components (Header/Footer) are injected by browser-side JavaScript (`component-loader.js`), NOT by a pre-processor.