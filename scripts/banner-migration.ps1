$rootPath = "D:\Properties4Creations-Official"
$files = Get-ChildItem -Path $rootPath -Recurse -Filter *.html

foreach ($f in $files) {
  $c = Get-Content $f.FullName -Raw

  # 1) Ensure banner container exists after header-container
  if ($c -match '<div id="header-container"></div>' -and $c -notmatch '<div id="page-banner-container"></div>') {
    $c = $c -replace '<div id="header-container"></div>', '<div id="header-container"></div>' + [Environment]::NewLine + '<div id="page-banner-container"></div>'
  }

  # 2) Remove legacy page-title-banner blocks safely
  $c = [regex]::Replace($c, '<section[^>]*class="[^"]*page-title-banner[^"]*"[\s\S]*?</section>', '', 'IgnoreCase')
  $c = [regex]::Replace($c, '<section[^>]*class="[^"]*hero-split[^"]*"[\s\S]*?</section>', '', 'IgnoreCase')

  # 3) Ensure banner-loader script inclusion before closing body
  if ($c -notmatch 'banner-loader.js') {
    $c = $c -replace '</body>', '<script src="js/banner-loader.js" defer></script>' + [Environment]::NewLine + '</body>'
  }

  # 4) Remove duplicate inline critical CSS affecting banners
  $c = [regex]::Replace($c, '<style>[\s\S]*?page-title-banner[\s\S]*?</style>', '', 'IgnoreCase')

  if ($c -ne (Get-Content $f.FullName -Raw)) {
    Copy-Item $f.FullName "$($f.FullName).bak" -Force
    Set-Content $f.FullName $c
    Write-Host "✅ Updated banner injection: $($f.FullName)"
  }
}
