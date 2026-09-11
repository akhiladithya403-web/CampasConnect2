@echo off
title Opening CampusConnect AI
echo =========================================================
echo   Opening CampusConnect AI in your default browser...
echo =========================================================
echo.

:: Try opening via localhost first
start "" "http://localhost:8080"

:: Also open direct file as instant backup
timeout /t 1 >nul
start "" "%~dp0index.html"

echo Done! The website is opening in your browser.
exit
