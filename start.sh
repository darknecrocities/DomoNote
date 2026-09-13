#!/usr/bin/env bash

# DomoNote - Single-Click All-in-One Automated Launcher
# Strictly avoids emoji characters.

set -e

echo "--------------------------------------------------------"
echo "  DomoNote - Local-First AI Workspace Launcher"
echo "  Capture it. Understand it. Keep it."
echo "--------------------------------------------------------"

# 1. Automate Ollama setup in background
if [ -f "scripts/setup-ollama.sh" ]; then
  bash scripts/setup-ollama.sh || echo "[DomoNote] Proceeding with browser-only mode..."
fi

# 2. Check if node_modules exists, install if missing
if [ ! -d "node_modules" ]; then
  echo "[DomoNote] Installing Node dependencies..."
  npm install
fi

# 3. Launch Vite development server
echo "[DomoNote] Starting DomoNote Web Application..."
npm run dev
