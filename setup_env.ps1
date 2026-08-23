# GenAI Environment Setup & Runner Script
Write-Host "Activating GenAI Virtual Environment..." -ForegroundColor Cyan
$VENV_PYTHON = "$PSScriptRoot\venv\Scripts\python.exe"

if (-not (Test-Path $VENV_PYTHON)) {
    Write-Host "Virtual environment not detected at $PSScriptRoot\venv. Creating..." -ForegroundColor Yellow
    & "C:\Users\Akshay\anaconda3\python.exe" -m venv "$PSScriptRoot\venv"
    & "$PSScriptRoot\venv\Scripts\pip.exe" install -r "$PSScriptRoot\requirements.txt"
}

Write-Host "Running GenAI Orchestration Master Suite..." -ForegroundColor Green
& $VENV_PYTHON "$PSScriptRoot\run_all.py"
