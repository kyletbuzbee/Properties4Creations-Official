# P4C Banner Cleanup & Injection Script
# Comprehensive solution to clean existing issues and properly inject banner system

$targetDir = "."
$bannerContainer = '<div id="page-banner-container"></div>'
$bannerScript = '<script src="js/banner-loader.js" defer></script>'

# Page-specific banner configurations
$configTemplates = @{
    "index.html" = @'
<script type="application/json" id="page-banner-config">
{
  "variant": "hero",
  "title": "Affordable Homes for Families & Veterans in East Texas",
  "subtitle": "We create safe, high-quality homes for families and veterans using vouchers — with transparency, trust, and local pride.",
  "background": "public/images/hero/front_porch_hero.webp",
  "eyebrow": "HUD-VASH & Section 8 Approved",
  "showVoucherBadge": true,
  "ctaText": "Browse Affordable Homes for Families & Veterans",
  "ctaHref": "get-started.html"
}
</script>
'@

    "contact.html" = @'
<script type="application/json" id="page-banner-config">
{
  "variant": "hero",
  "title": "Let's Create Homes Together",
  "subtitle": "Connect with our veteran-led team to explore housing partnerships, fair offers, or renovation questions. Veteran-owned, veteran-focused.",
  "background": "public/images/hero/front_porch_hero.webp",
  "eyebrow": "Veteran-Owned & Operated",
  "showVoucherBadge": true,
  "ctaText": "Start a Conversation",
  "ctaHref": "#contact-form"
}
</script>
'@

    "about.html" = @'
<script type="application/json" id="page-banner-config">
{
  "variant": "hero",
  "title": "Our Mission: Homes for Heroes",
  "subtitle": "From service to stability, we honor veterans with premium renovations and fair pricing. Every home tells the story of those who served.",
  "background": "public/images/hero/front_porch_hero.webp",
  "eyebrow": "Veteran Founded, Veteran Focused",
  "showVoucherBadge": true,
  "ctaText": "See Our Impact",
  "ctaHref": "impact.html"
}
</script>
'@

    "projects.html" = @'
<script type="application/json" id="page-banner-config">
{
  "variant": "hero",
  "title": "Transforming Properties into Homes",
  "subtitle": "Explore our East Texas property portfolio — from historic renovations to modern updates, all designed for families and veterans.",
  "background": "public/images/hero/front_porch_hero.webp",
  "eyebrow": "40+ Properties Renovated",
  "showVoucherBadge": false,
  "ctaText": "View Available Properties",
  "ctaHref": "get-started.html"
}
</script>
'@

    "impact.html" = @'
<script type="application/json" id="page-banner-config">
{
  "variant": "hero",
  "title": "Impact That Lasts Generations",
  "subtitle": "Every renovated home creates stability for a family. Every veteran served honors our commitment to those who protect our freedom.",
  "background": "public/images/hero/front_porch_hero.webp",
  "eyebrow": "Building Communities Together",
  "showVoucherBadge": true,
  "ctaText": "Join Our Mission",
  "ctaHref": "contact.html"
}
</script>
'@

    "resources.html" = @'
<script type="application/json" id="page-banner-config">
{
  "variant": "hero",
  "title": "Resources for East Texas Families",
  "subtitle": "Navigate housing assistance, veterans benefits, and community programs. We're here to help you find the right path to housing stability.",
  "background": "public/images/hero/front_porch_hero.webp",
  "eyebrow": "Trusted Housing Resources",
  "showVoucherBadge": false,
  "ctaText": "Explore Resources",
  "ctaHref": "#resources-section"
}
</script>
'@

    "privacy.html" = @'
<script type="application/json" id="page-banner-config">
{
  "variant": "standard",
  "title": "Privacy & Transparency",
  "subtitle": "Your trust matters. Learn how we protect your information while delivering transparent housing solutions.",
  "background": "",
  "eyebrow": "Your Privacy Matters",
  "showVoucherBadge": false,
  "ctaText": "Contact Us",
  "ctaHref": "contact.html"
}
</script>
'@

    "terms.html" = @'
<script type="application/json" id="page-banner-config">
{
  "variant": "standard",
  "title": "Terms of Service",
  "subtitle": "Clear terms for clear relationships. Understanding our commitment to fair housing practices and veteran service.",
  "background": "",
  "eyebrow": "Service Terms & Conditions",
  "showVoucherBadge": false,
  "ctaText": "Contact Support",
  "ctaHref": "contact.html"
}
</script>
'@

    "transparency.html" = @'
<script type="application/json" id="page-banner-config">
{
  "variant": "hero",
  "title": "Transparency You Can Trust",
  "subtitle": "Our veteran-owned approach means honest pricing, clear communication, and commitments we keep. No surprises, just results.",
  "background": "public/images/hero/front_porch_hero.webp",
  "eyebrow": "Honest Veteran Pricing",
  "showVoucherBadge": false,
  "ctaText": "Learn Our Process",
  "ctaHref": "about.html"
}
</script>
'@

    "get-started.html" = @'
<script type="application/json" id="page-banner-config">
{
  "variant": "hero",
  "title": "Find Your Path to Housing Stability",
  "subtitle": "From vouchers to veteran benefits, let our team guide you through the housing assistance programs available in East Texas.",
  "background": "public/images/hero/front_porch_hero.webp",
  "eyebrow": "Housing Support Starts Here",
  "showVoucherBadge": true,
  "ctaText": "Explore Housing Options",
  "ctaHref": "#housing-options"
}
</script>
'@
}

# Get all HTML files excluding 404, test-runner, and thank-you
$files = Get-ChildItem -Path $targetDir -Recurse -Include *.html | Where-Object {
    $_.Name -notmatch "404|test-runner|thank-you"
}

$totalFiles = $files.Count
$processedFiles = 0

foreach ($file in $files) {
    $fileName = $file.Name
    $filePath = $file.FullName

    Write-Host "Processing $($file.Name)... ($($processedFiles + 1)/$totalFiles)"

    $content = Get-Content $filePath -Raw
    $modified = $false

    # 1. CLEANUP: Remove duplicate banner containers (keep the well-positioned one)
    $originalContent = $content
    if (($content -split "#page-banner-container").Count -gt 2) {
        Write-Host "  → Removing duplicate banner containers"
        # Remove all banner containers first
        $content = $content -replace '<div id="page-banner-container"></div>', ''
        # Then we'll add back the properly positioned one
        $modified = $true
    }

    # 2. CLEANUP: Remove legacy banner sections (multiline safe)
    if ($content -match '<section class="page-title-banner') {
        Write-Host "  → Removing legacy banner section"
        $content = $content -replace '(?s)<section class="page-title-banner.*?</section>', ''
        $modified = $true
    }

    # 3. CLEANUP: Remove duplicate banner config scripts
    $configMatches = [regex]::Matches($content, '<script type="application/json" id="page-banner-config">')
    if ($configMatches.Count -gt 1) {
        Write-Host "  → Removing duplicate banner configs"
        # Remove all configs first, then add back the proper one
        $content = $content -replace '(?s)<script type="application/json" id="page-banner-config">.*?</script>', ''
        $modified = $true
    }

    # 4. CLEANUP: Remove duplicate banner scripts
    $scriptMatches = [regex]::Matches($content, '<script src="js/banner-loader.js" defer></script>')
    if ($scriptMatches.Count -gt 1) {
        Write-Host "  → Removing duplicate banner scripts"
        # Remove all scripts first, then add back properly positioned one
        $content = $content -replace '<script src="js/banner-loader.js" defer></script>', ''
        $modified = $true
    }

    # 5. FIX POSITIONING: Ensure banner container is after header-container
    $headerMatch = $content -match '<div id="header-container"></div>'
    $bannerMatch = $content -match '<div id="page-banner-container"></div>'

    if ($headerMatch -and -not $bannerMatch) {
        # Add banner container after header
        Write-Host "  → Adding missing banner container after header"
        $content = $content -replace '(?<=<div id="header-container"></div>)', "`r`n$bannerContainer`r`n"
        $modified = $true
    } elseif ($headerMatch -and $bannerMatch) {
        # Check if banner is properly positioned after header
        $headerIndex = $content.IndexOf('<div id="header-container"></div>')
        $bannerIndex = $content.IndexOf('<div id="page-banner-container"></div>')

        if ($bannerIndex -lt $headerIndex) {
            # Banner is before header, move it after
            Write-Host "  → Repositioning banner container after header"
            $content = $content -replace '<div id="page-banner-container"></div>', ''
            $content = $content -replace '(?<=<div id="header-container"></div>)', "`r`n$bannerContainer`r`n"
            $modified = $true
        }
    }

    # 6. ADD CONFIG: Add page-specific banner config if not present
    if ($configTemplates.ContainsKey($fileName) -and -not ($content -match '<script type="application/json" id="page-banner-config">')) {
        Write-Host "  → Adding page-specific banner config"
        $config = $configTemplates[$fileName]
        if ($content -match '<main[^>]*>') {
            $content = $content -replace '(?<=<main[^>]*>)', "`r`n$config`r`n"
            $modified = $true
        }
    }

    # 7. ADD SCRIPT: Add banner loader script if not present
    if (-not ($content -match '<script src="js/banner-loader.js" defer></script>')) {
        Write-Host "  → Adding banner loader script"
        $content = $content -replace '(?=</body>)', "`r`n$bannerScript`r`n"
        $modified = $true
    }

    # 8. SAVE: Only save if content was modified
    if ($content -ne $originalContent) {
        Set-Content -Path $filePath -Value $content -Encoding UTF8
        Write-Host "  ✅ $($file.Name) updated successfully"
    } else {
        Write-Host "  → No changes needed for $($file.Name)"
    }

    $processedFiles++
}

Write-Host "`n✅ Banner cleanup and injection complete! Processed $totalFiles files."

# Run final validation
Write-Host "`n🔍 Running final validation..."
& "$PSScriptRoot/banner-audit.ps1"
