#!/usr/bin/env bash
# Start Enterprise GenAI Engineering Console UI Server (Linux / macOS)
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

PYTHON_EXE="$SCRIPT_DIR/venv/bin/python"
if [ ! -f "$PYTHON_EXE" ]; then
    if command -v python3 &>/dev/null; then
        PYTHON_EXE="python3"
    else
        PYTHON_EXE="python"
    fi
fi

echo "============================================================"
echo " Starting Enterprise GenAI Engineering Web Console..."
echo " Host: http://127.0.0.1:8000"
echo "============================================================"

# Attempt to open browser if open/xdg-open is available
if command -v xdg-open &>/dev/null; then
    xdg-open "http://127.0.0.1:8000" &
elif command -v open &>/dev/null; then
    open "http://127.0.0.1:8000" &
fi

"$PYTHON_EXE" ui_server.py --port 8000
