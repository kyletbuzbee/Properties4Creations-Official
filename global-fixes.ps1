# Global Fixes Script for Properties 4 Creations
# Applies canonical/meta tags, accessibility skip link, CSS/JS includes, and header/footer containers

$files = Get-ChildItem -Path . -Filter *.html -Recurse

foreach ($file in $files) {
    Write-Host "Processing $($file.FullName)..."

    $content = Get-Content $file.FullName -Raw

    # Ensure meta description
    if ($content -notmatch '<meta name="description"') {
        $replacement = '$1`n    <meta name="description" content="Affordable housing solutions for families and veterans in East Texas. Transparent pricing, premium renovations, and community impact.">'
        $content = $content -replace '(<title>.*?</title>)', $replacement
    }

    # Ensure canonical link
    if ($content -notmatch '<link rel="canonical"') {
        $pageName = $file.Name
        $replacement = '$1`n    <link rel="canonical" href="https://properties4creations.com/' + $pageName + '">'
        $content = $content -replace '(<meta name="description".*?>)', $replacement
    }

    # Ensure skip-to-content link
    if ($content -notmatch 'skip-to-content') {
        $replacement = '$1`n    <!-- Accessibility: Skip to main content -->`n    <a href="#main" class="skip-to-content">Skip to main content</a>'
        $content = $content -replace '(<body[^>]*>)', $replacement
    }

    # Ensure header/footer containers
    if ($content -notmatch 'header-container') {
        $replacement = '$1`n    <div id="header-container"></div>`n    <div id="page-banner-container"></div>`n    <main'
        $content = $content -replace '(<body[^>]*>.*?)(<main)', $replacement
    }
    if ($content -notmatch 'footer-container') {
        $replacement = '$1`n    <div id="footer-container"></div>'
        $content = $content -replace '(</main>)', $replacement
    }

    # Ensure CSS includes
    if ($content -notmatch 'design-tokens.css') {
        $replacement = '$1`n    <!-- Design System CSS (MUST be first) -->`n    <link rel="stylesheet" href="css/design-tokens.css">`n    <link rel="stylesheet" href="css/components.css">`n    <link rel="stylesheet" href="css/main.css">'
        $content = $content -replace '(<head>.*?<title>.*?</title>)', $replacement
    }

    # Ensure JS includes
    if ($content -notmatch 'component-loader.js') {
        $replacement = '    <script src="components/component-loader.js"></script>`n    <script src="accessibility-enhanced.js"></script>`n    <script src="js/banner-loader.js" defer></script>`n</body>'
        $content = $content -replace '(</body>)', $replacement
    }

    # Save backup
    $backupPath = $file.FullName + ".bak"
    Set-Content -Path $backupPath -Value $content

    # Overwrite original
    Set-Content -Path $file.FullName -Value $content
}
