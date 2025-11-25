@echo off
echo ================================================
echo P4C Banner System Fix Script
echo ================================================

echo Removing legacy banners...
for %%f in (pages\about.html pages\get-started.html pages\impact.html pages\projects.html pages\privacy.html pages\resources.html pages\terms.html pages\transparency.html) do (
    echo Processing %%f...
    powershell -Command "
        $content = Get-Content '%%f' -Raw;
        $content = $content -replace '(?s)<section class=\"page-title-banner.*?</section>', '';
        Set-Content '%%f' $content -Encoding UTF8;
        Write-Host '  Removed legacy banner from %%f'
    "
)

echo.
echo Adding page-specific banner configurations...

powershell -ExecutionPolicy Bypass -Command "
    # Define configs
    $configs = @{
        'pages/about.html' = @'
<script type=\"application/json\" id=\"page-banner-config\">
{
  \"variant\": \"hero\",
  \"title\": \"Our Mission: Homes for Heroes\",
  \"subtitle\": \"From service to stability, we honor veterans with premium renovations and fair pricing. Every home tells the story of those who served.\",
  \"background\": \"public/images/hero/front_porch_hero.webp\",
  \"eyebrow\": \"Veteran Founded, Veteran Focused\",
  \"showVoucherBadge\": true,
  \"ctaText\": \"See Our Impact\",
  \"ctaHref\": \"impact.html\"
}
</script>
'@

        'pages/projects.html' = @'
<script type=\"application/json\" id=\"page-banner-config\">
{
  \"variant\": \"hero\",
  \"title\": \"Transforming Properties into Homes\",
  \"subtitle\": \"Explore our East Texas property portfolio — from historic renovations to modern updates, all designed for families and veterans.\",
  \"background\": \"public/images/hero/front_porch_hero.webp\",
  \"eyebrow\": \"40+ Properties Renovated\",
  \"showVoucherBadge\": false,
  \"ctaText\": \"View Available Properties\",
  \"ctaHref\": \"get-started.html\"
}
</script>
'@

        'pages/impact.html' = @'
<script type=\"application/json\" id=\"page-banner-config\">
{
  \"variant\": \"hero\",
  \"title\": \"Impact That Lasts Generations\",
  \"subtitle\": \"Every renovated home creates stability for a family. Every veteran served honors our commitment to those who protect our freedom.\",
  \"background\": \"public/images/hero/front_porch_hero.webp\",
  \"eyebrow\": \"Building Communities Together\",
  \"showVoucherBadge\": true,
  \"ctaText\": \"Join Our Mission\",
  \"ctaHref\": \"contact.html\"
}
</script>
'@

        'pages/resources.html' = @'
<script type=\"application/json\" id=\"page-banner-config\">
{
  \"variant\": \"hero\",
  \"title\": \"Resources for East Texas Families\",
  \"subtitle\": \"Navigate housing assistance, veterans benefits, and community programs. We're here to help you find the right path to housing stability.\",
  \"background\": \"public/images/hero/front_porch_hero.webp\",
  \"eyebrow\": \"Trusted Housing Resources\",
  \"showVoucherBadge\": false,
  \"ctaText\": \"Explore Resources\",
  \"ctaHref\": \"#resources-section\"
}
</script>
'@

        'pages/privacy.html' = @'
<script type=\"application/json\" id=\"page-banner-config\">
{
  \"variant\": \"standard\",
  \"title\": \"Privacy & Transparency\",
  \"subtitle\": \"Your trust matters. Learn how we protect your information while delivering transparent housing solutions.\",
  \"background\": \"\",
  \"eyebrow\": \"Your Privacy Matters\",
  \"showVoucherBadge\": false,
  \"ctaText\": \"Contact Us\",
  \"ctaHref\": \"contact.html\"
}
</script>
'@

        'pages/terms.html' = @'
<script type=\"application/json\" id=\"page-banner-config\">
{
  \"variant\": \"standard\",
  \"title\": \"Terms of Service\",
  \"subtitle\": \"Clear terms for clear relationships. Understanding our commitment to fair housing practices and veteran service.\",
  \"background\": \"\",
  \"eyebrow\": \"Service Terms & Conditions\",
  \"showVoucherBadge\": false,
  \"ctaText\": \"Contact Support\",
  \"ctaHref\": \"contact.html\"
}
</script>
'@

        'pages/transparency.html' = @'
<script type=\"application/json\" id=\"page-banner-config\">
{
  \"variant\": \"hero\",
  \"title\": \"Transparency You Can Trust\",
  \"subtitle\": \"Our veteran-owned approach means honest pricing, clear communication, and commitments we keep. No surprises, just results.\",
  \"background\": \"public/images/hero/front_porch_hero.webp\",
  \"eyebrow\": \"Honest Veteran Pricing\",
  \"showVoucherBadge\": false,
  \"ctaText\": \"Learn Our Process\",
  \"ctaHref\": \"about.html\"
}
</script>
'@

        'pages/get-started.html' = @'
<script type=\"application/json\" id=\"page-banner-config\">
{
  \"variant\": \"hero\",
  \"title\": \"Find Your Path to Housing Stability\",
  \"subtitle\": \"From vouchers to veteran benefits, let our team guide you through the housing assistance programs available in East Texas.\",
  \"background\": \"public/images/hero/front_porch_hero.webp\",
  \"eyebrow\": \"Housing Support Starts Here\",
  \"showVoucherBadge\": true,
  \"ctaText\": \"Explore Housing Options\",
  \"ctaHref\": \"#housing-options\"
}
</script>
'@
    }

    foreach ($file in $configs.Keys) {
        if (Test-Path $file) {
            $content = Get-Content $file -Raw
            $config = $configs[$file]

            # Add config after <main> if not present
            if (-not ($content -match 'page-banner-config')) {
                if ($content -match '<main[^>]*>') {
                    $content = $content -replace '(?<=<main[^>]*>)', \"`r`n$config`r`n\"
                    Set-Content $file $content -Encoding UTF8
                    Write-Host \"  Added banner config to $file\"
                }
            }

            # Add banner loader script if not present
            if (-not ($content -match 'js/banner-loader.js')) {
                $content = $content -replace '(?=</body>)', \"`r`n<script src=\"js/banner-loader.js\" defer></script>`r`n\"
                Set-Content $file $content -Encoding UTF8
                Write-Host \"  Added banner loader to $file\"
            }
        }
    }
"

echo.
echo ================================================
echo Running final audit...
echo ================================================

powershell -ExecutionPolicy Bypass -File banner-audit.ps1

echo.
echo ================================================
echo Process complete!
echo ================================================

pause
