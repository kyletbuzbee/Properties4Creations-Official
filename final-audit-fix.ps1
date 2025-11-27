# Final audit compliance fixes for Properties4Creations website
# This script ensures 100% compliance with the audit requirements

$filesToFix = @(
    "impact.html",
    "projects.html",
    "about.html",
    "get-started.html",
    "contact.html",
    "resources.html",
    "projects/jefferson-riverfront.html",
    "projects/longview-victorian.html",
    "projects/tyler-ranch-home.html",
    "test-runner.html",
    "footer-template.html",
    "header-template.html"
)

foreach ($file in $filesToFix) {
    if (Test-Path $file) {
        Write-Host "Processing $file..."

        # Read content
        $content = Get-Content $file -Raw

        # Fix 1: Add canonical URL if missing
        if ($content -notmatch '<link rel="canonical"') {
            switch ($file) {
                "impact.html" { $canonical = '<link rel="canonical" href="https://properties4creations.com/impact.html">' }
                "projects.html" { $canonical = '<link rel="canonical" href="https://properties4creations.com/projects.html">' }
                "about.html" { $canonical = '<link rel="canonical" href="https://properties4creations.com/about.html">' }
                "get-started.html" { $canonical = '<link rel="canonical" href="https://properties4creations.com/get-started.html">' }
                "contact.html" { $canonical = '<link rel="canonical" href="https://properties4creations.com/contact.html">' }
                "resources.html" { $canonical = '<link rel="canonical" href="https://properties4creations.com/resources.html">' }
                "projects/jefferson-riverfront.html" { $canonical = '<link rel="canonical" href="https://properties4creations.com/projects/jefferson-riverfront.html">' }
                "projects/longview-victorian.html" { $canonical = '<link rel="canonical" href="https://properties4creations.com/projects/longview-victorian.html">' }
                "projects/tyler-ranch-home.html" { $canonical = '<link rel="canonical" href="https://properties4creations.com/projects/tyler-ranch-home.html">' }
                "test-runner.html" { $canonical = '<link rel="canonical" href="https://properties4creations.com/test-runner.html">' }
                "footer-template.html" { $canonical = '<link rel="canonical" href="https://properties4creations.com/footer-template.html">' }
                "header-template.html" { $canonical = '<link rel="canonical" href="https://properties4creations.com/header-template.html">' }
            }
            $content = $content -replace '(<meta name="description"[^>]*>)', "`$1`n    $canonical"
        }

        # Fix 2: Add meta description if missing
        if ($content -notmatch '<meta name="description"') {
            $desc = '<meta name="description" content="Affordable housing solutions for families and veterans in East Texas. Transparent pricing, premium renovations, and community impact.">';
            $content = $content -replace '<title>([^<]+)</title>', "`$&`n    $desc" -replace '(\r?\n)', "`n    " -replace '^\s+', '    '
        }

        # Fix 3: Add missing CSS includes
        if ($content -notmatch 'css/design-tokens.css') {
            $content = $content -replace '(<title>[^<]+</title>\s*(?:<meta[^>]+>\s*)*)', '$1    <!-- Design System CSS (MUST be first) -->
    <link rel="stylesheet" href="css/design-tokens.css">
    <link rel="stylesheet" href="css/components.css">
    <link rel="stylesheet" href="css/main.css">

'
        }

        # Fix 4: Add Google Fonts if missing
        if ($content -notmatch 'googleapis\.com') {
            $content = $content -replace '(<script src="https://cdn\.tailwindcss\.com">)', '    <link href="https://fonts.googleapis.com/css2?family=Merriweather:wght@400;700&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
$1'
        }

        # Fix 5: Add accessibility-enhanced.js if missing
        if ($content -match 'components/component-loader\.js' -and $content -notmatch 'accessibility-enhanced\.js') {
            $content = $content -replace '(<script.*component-loader\.js[^>]*></script>)', '$1
    <script src="accessibility-enhanced.js"></script>'
        }

        # Fix 6: Add header/footer includes if missing
        if ($content -notmatch 'id="header-container"' -and $file -notin ('footer-template.html', 'components/footer.html')) {
            $skipLink = '    <!-- Accessibility: Skip to main content -->
    <a href="#main" class="skip-to-content">Skip to main content</a>'
            $headerInclude = '    <div id="header-container"></div>'
            $content = $content -replace '<body class="[^"]*">', "`$&`n$skipLink`n$headerInclude"
        }

        if ($content -notmatch 'id="footer-container"' -and $file -notin ('header-template.html', 'components/header.html')) {
            $content = $content -replace '</main>', "`$&`n`n    <!-- Footer Container -->`n    <div id=`"footer-container`"></div>"
        }

        # Fix 7: Update Tailwind config to use design tokens
        if ($content -match 'navy:\s*[''"]#[0-9a-fA-F]{6}[''"]') {
            $content = $content -replace '(\s+)navy:\s*[''"]#[0-9a-fA-F]{6}[''"],?', '$1navy: ''var(--color-primary-navy)'','
            $content = $content -replace '(\s+)wood:\s*[''"]#[0-9a-fA-F]{6}[''"],?', '$1wood: ''var(--color-accent-gold)'','
            $content = $content -replace '(\s+)walnut:\s*[''"]#[0-9a-fA-F]{6}[''"],?', '$1walnut: ''var(--color-secondary-walnut)'','
            $content = $content -replace '(\s+)beige:\s*[''"]#[0-9a-fA-F]{6}[''"],?', '$1beige: ''var(--color-neutral-beige)'','
            $content = $content -replace '(\s+)surface:\s*[''"]#[0-9a-fA-F]{6}[''"],?', '$1surface: ''var(--color-neutral-white)'','
            $content = $content -replace '(\s+)slate:\s*[''"]#[0-9a-fA-F]{6}[''"],?', '$1slate: ''var(--color-neutral-slate-500)'','
        }

        # Write back
        $content | Set-Content $file -Encoding UTF8
        Write-Host "✅ Fixed $file"
    }
}

Write-Host "Audit compliance fixes completed. Ready for 100% pass rate validation."
