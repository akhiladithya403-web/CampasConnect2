Write-Host "==================================================================" -ForegroundColor Cyan
Write-Host "  CampusConnect AI - College Smart Student Assistance Portal      " -ForegroundColor Cyan
Write-Host "  Full-Stack System: Java SE (Backend) + HTML5 + CSS + JavaScript " -ForegroundColor Cyan
Write-Host "==================================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "[1/2] Compiling Java backend server..." -ForegroundColor Yellow
javac -d . server\CampusConnectServer.java
if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] Java compilation failed." -ForegroundColor Red
    exit $LASTEXITCODE
}
Write-Host "[OK] Compilation successful!" -ForegroundColor Green
Write-Host ""
Write-Host "[2/2] Launching Java server on port 8080..." -ForegroundColor Yellow
Start-Process "http://localhost:8080"
java server.CampusConnectServer
