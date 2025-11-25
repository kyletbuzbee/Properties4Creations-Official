# P4C Banner Validation Script
# Checks each HTML file for banner container, config block, and script

$targetDir = "."
$logFile = "banner-validation-log.txt"
$results = @()

# Get all HTML files excluding 404, test-runner, and thank-you
$files = Get-ChildItem -Path $targetDir -Recurse -Include *.html | Where-Object {
    $_.Name -notmatch "404|test-runner|thank-you"
}

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    $status = @{
        File = $file.Name
        Container = $content -match "#page-banner-container"
        Config = $content -match "id=\"page-banner-config\""
        Script = $content -match "js/banner-loader.js"
        LegacyBanner = $content -match "class=\"page-title-banner"
    }

    $issues = @()
    if (-not $status.Container) { $issues += "❌ Missing container" }
    if (-not $status.Config) { $issues += "❌ Missing config block" }
    if (-not $status.Script) { $issues += "❌ Missing script tag" }
    if ($status.LegacyBanner) { $issues += "⚠️ Legacy banner still present" }

    if ($issues.Count -eq 0) {
        $results += "$($status.File): ✅ All checks passed"
    } else {
        $results += "$($status.File): " + ($issues -join ", ")
    }
}

# Write results to log file
$results | Out-File -FilePath $logFile -Encoding UTF8
Write-Host "✅ Validation complete. See $logFile for details."
