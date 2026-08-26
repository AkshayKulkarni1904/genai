# GenAI Environment Setup & Runner Script (PowerShell)
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $ScriptDir

Write-Host "============================================================" -ForegroundColor Cyan
Write-Host " Setting up Enterprise GenAI Environment..." -ForegroundColor Green
Write-Host "============================================================" -ForegroundColor Cyan

$VENV_PYTHON = Join-Path $ScriptDir "venv\Scripts\python.exe"

if (-not (Test-Path $VENV_PYTHON)) {
    Write-Host "Virtual environment not detected at $ScriptDir\venv. Searching for Python..." -ForegroundColor Yellow
    
    $SystemPython = $null
    if (Get-Command "python.exe" -ErrorAction SilentlyContinue) {
        $SystemPython = "python.exe"
    } elseif (Get-Command "py.exe" -ErrorAction SilentlyContinue) {
        $SystemPython = "py.exe"
    } elseif (Test-Path "$env:USERPROFILE\anaconda3\python.exe") {
        $SystemPython = "$env:USERPROFILE\anaconda3\python.exe"
    } else {
        $SystemPython = "python"
    }

    Write-Host "Creating virtual environment using: $SystemPython" -ForegroundColor Cyan
    & $SystemPython -m venv "$ScriptDir\venv"
    
    $PipExe = Join-Path $ScriptDir "venv\Scripts\pip.exe"
    Write-Host "Installing production dependencies from requirements.txt..." -ForegroundColor Cyan
    & $PipExe install -r "$ScriptDir\requirements.txt"
}

Write-Host "`nRunning GenAI Orchestration Master Suite..." -ForegroundColor Green
& $VENV_PYTHON "$ScriptDir\run_all.py"
