@echo off
REM Start Enterprise GenAI Engineering Console UI Server (Windows CMD)
cd /d "%~dp0"

set PYTHON_EXE=venv\Scripts\python.exe
if not exist "%PYTHON_EXE%" (
    set PYTHON_EXE=python
)

echo ============================================================
echo  Starting Enterprise GenAI Engineering Web Console...
echo  Host: http://127.0.0.1:8000
echo ============================================================

start http://127.0.0.1:8000
"%PYTHON_EXE%" ui_server.py --port 8000
pause
