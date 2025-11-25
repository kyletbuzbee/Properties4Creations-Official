@echo off
echo ================================================
echo P4C Banner Cleanup and Injection Script
echo ================================================

echo Starting comprehensive banner system cleanup...
echo.

powershell -ExecutionPolicy Bypass -File "banner-cleanup-injection.ps1"

echo.
echo ================================================
echo Process complete!
echo ================================================

pause
