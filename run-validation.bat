@echo off
echo 🔍 P4C Enterprise Funnel Integration Test
echo ==================================================

echo.
echo 📁 Checking required files...
set "files_exist=0"
set "total_files=6"

if exist "get-started.html" (
    echo ✅ get-started.html exists
    set /a files_exist+=1
) else (
    echo ❌ get-started.html missing
)

if exist "about.html" (
    echo ✅ about.html exists
    set /a files_exist+=1
) else (
    echo ❌ about.html missing
)

if exist "transparency.html" (
    echo ✅ transparency.html exists
    set /a files_exist+=1
) else (
    echo ❌ transparency.html missing
)

if exist "css\design-tokens.css" (
    echo ✅ css/design-tokens.css exists
    set /a files_exist+=1
) else (
    echo ❌ css/design-tokens.css missing
)

if exist "components\component-loader.js" (
    echo ✅ components/component-loader.js exists
    set /a files_exist+=1
) else (
    echo ❌ components/component-loader.js missing
)

if exist "validation-test.js" (
    echo ✅ validation-test.js exists
    set /a files_exist+=1
) else (
    echo ❌ validation-test.js missing
)

echo.
echo 🔧 Validating HTML structure...

echo Checking get-started.html...
findstr /C:"id=\"header-container\"" "get-started.html" >nul && echo ✅ get-started.html - Header Container || echo ❌ get-started.html - Header Container
findstr /C:"id=\"footer-container\"" "get-started.html" >nul && echo ✅ get-started.html - Footer Container || echo ❌ get-started.html - Footer Container
findstr /C:"components/component-loader.js" "get-started.html" >nul && echo ✅ get-started.html - Component Loader || echo ❌ get-started.html - Component Loader
findstr /C:"<main" "get-started.html" >nul && echo ✅ get-started.html - Main Element || echo ❌ get-started.html - Main Element
findstr /C:"impact-form" "get-started.html" >nul && echo ✅ get-started.html - Impact Form || echo ❌ get-started.html - Impact Form
findstr /C:"flow-node" "get-started.html" >nul && echo ✅ get-started.html - Impact Flow Visualization || echo ❌ get-started.html - Impact Flow Visualization

echo.
echo Checking about.html...
findstr /C:"id=\"header-container\"" "about.html" >nul && echo ✅ about.html - Header Container || echo ❌ about.html - Header Container
findstr /C:"id=\"footer-container\"" "about.html" >nul && echo ✅ about.html - Footer Container || echo ❌ about.html - Footer Container
findstr /C:"components/component-loader.js" "about.html" >nul && echo ✅ about.html - Component Loader || echo ❌ about.html - Component Loader
findstr /C:"<main" "about.html" >nul && echo ✅ about.html - Main Element || echo ❌ about.html - Main Element
findstr /C:"Chain of Good" "about.html" >nul && echo ✅ about.html - Chain of Good Section || echo ❌ about.html - Chain of Good Section

echo.
echo ==================================================
echo 📊 SUMMARY: %files_exist%/%total_files% required files present
echo 🔗 Integration test complete - Review results above
pause
