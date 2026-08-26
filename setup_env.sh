#!/usr/bin/env bash
# GenAI Environment Setup & Runner Script (Linux / macOS)
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "============================================================"
echo " Setting up Enterprise GenAI Environment..."
echo "============================================================"

VENV_DIR="$SCRIPT_DIR/venv"
VENV_PYTHON="$VENV_DIR/bin/python"

if [ ! -f "$VENV_PYTHON" ]; then
    echo "Virtual environment not detected at $VENV_DIR. Creating..."
    
    PYTHON_CMD=""
    if command -v python3 &>/dev/null; then
        PYTHON_CMD="python3"
    elif command -v python &>/dev/null; then
        PYTHON_CMD="python"
    else
        echo "Error: Python 3 not found in PATH."
        exit 1
    fi
    
    echo "Creating virtual environment using: $PYTHON_CMD"
    $PYTHON_CMD -m venv "$VENV_DIR"
    
    echo "Installing production dependencies from requirements.txt..."
    "$VENV_DIR/bin/pip" install --upgrade pip
    "$VENV_DIR/bin/pip" install -r "$SCRIPT_DIR/requirements.txt"
fi

echo ""
echo "Running GenAI Orchestration Master Suite..."
"$VENV_PYTHON" "$SCRIPT_DIR/run_all.py"
