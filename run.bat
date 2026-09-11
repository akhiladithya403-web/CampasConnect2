@echo off
title CampusConnect AI - Java Server
color 0B
echo ==================================================================
echo   CampusConnect AI - College Smart Student Assistance Portal
echo   Full-Stack System: Java SE (Backend) + HTML5 + CSS + JavaScript
echo ==================================================================
echo.
echo [1/2] Compiling CampusConnectServer.java...
javac CampusConnectServer.java
if %errorlevel% neq 0 (
    echo [ERROR] Java compilation failed. Please verify JDK is installed.
    pause
    exit /b %errorlevel%
)
echo [OK] Compilation successful!
echo.
echo [2/2] Launching Java server on port 8080...
start "" "http://localhost:8080"
echo.
java CampusConnectServer
pause
