# Start Enterprise GenAI Engineering Console UI Server (PowerShell)
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $ScriptDir

$PythonExe = Join-Path $ScriptDir "venv\Scripts\python.exe"
if (-not (Test-Path $PythonExe)) {
    $PythonExe = "python"
}

Write-Host "============================================================" -ForegroundColor Cyan
Write-Host " Starting Enterprise GenAI Engineering Web Console..." -ForegroundColor Green
Write-Host " Host: http://127.0.0.1:8000" -ForegroundColor Yellow
Write-Host "============================================================" -ForegroundColor Cyan

# Open browser after a brief pause
Start-Process "http://127.0.0.1:8000"

# Run server
& $PythonExe ui_server.py --port 8000
