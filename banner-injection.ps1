# P4C Banner Injection Script
# Injects dynamic banner loader markup, config block, and script into HTML files

$bannerContainer = '<div id="page-banner-container"></div>'
$bannerScript = '<script src="js/banner-loader.js" defer></script>'
$bannerConfig = @'
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

# Target directory
$targetDir = "."

# Get all HTML files excluding 404, test-runner, and thank-you
$files = Get-ChildItem -Path $targetDir -Recurse -Include *.html | Where-Object {
    $_.Name -notmatch "404|test-runner|thank-you" -and
    (Get-Content $_.FullName) -notmatch "#page-banner-container"
}

foreach ($file in $files) {
    Write-Host "Injecting banner into $($file.Name)..."

    $content = Get-Content $file.FullName -Raw

    # Inject banner container after header
    $content = $content -replace '(?<=<div id="header-container"></div>)', "`r`n$bannerContainer`r`n"

    # Inject config block before <main>
    $content = $content -replace '(?<=<main[^>]*>)', "`r`n$bannerConfig`r`n"

    # Inject script before </body>
    $content = $content -replace '(?=</body>)', "`r`n$bannerScript`r`n"

    # Remove legacy banner sections (multiline safe)
    $content = $content -replace '(?s)<section class="page-title-banner.*?</section>', ''

    # Save updated file
    Set-Content -Path $file.FullName -Value $content
}

Write-Host "✅ Banner injection complete."
