#!/usr/bin/env bash

# DomoNote - Automated Linux Desktop Installer & Desktop Entry Creator
# Sets up dependencies, installs system desktop shortcut, and launches DomoNote.

set -e

echo "========================================================"
echo "  DomoNote Desktop - Linux Automated Setup"
echo "  Capture it. Understand it. Keep it."
echo "========================================================"

# 1. Determine Working Directory
if [ -f "package.json" ]; then
  APP_DIR="$(pwd)"
else
  APP_DIR="$HOME/.domonote"
  if [ ! -d "$APP_DIR" ]; then
    echo "[DomoNote] Cloning DomoNote repository to $APP_DIR..."
    git clone https://github.com/darknecrocities/DomoNote.git "$APP_DIR"
  else
    echo "[DomoNote] Updating existing DomoNote in $APP_DIR..."
    cd "$APP_DIR" && git pull || true
  fi
fi

cd "$APP_DIR"

# 2. Check Node.js and npm
if ! command -v node >/dev/null 2>&1; then
  echo "[Error] Node.js is not installed."
  echo "Please install Node.js (v18+) via your package manager:"
  echo "  Ubuntu/Debian: sudo apt install -y nodejs npm"
  echo "  Fedora:        sudo dnf install -y nodejs npm"
  echo "  Arch Linux:    sudo pacman -S nodejs npm"
  exit 1
fi

# 3. Check Ollama
if [ -f "scripts/setup-ollama.sh" ]; then
  bash scripts/setup-ollama.sh || echo "[DomoNote] Proceeding with offline browser mode..."
fi

# 4. Install Dependencies
if [ ! -d "node_modules" ]; then
  echo "[DomoNote] Installing Node dependencies..."
  npm install --no-audit --no-fund
fi

# 5. Create FreeDesktop .desktop Application Entry
APPS_DIR="$HOME/.local/share/applications"
mkdir -p "$APPS_DIR"

ICON_PATH="$APP_DIR/public/official_domonote.png"
DESKTOP_ENTRY="$APPS_DIR/domonote.desktop"

cat << EOF > "$DESKTOP_ENTRY"
[Desktop Entry]
Name=DomoNote
Comment=Your Personal AI Secretary for meetings, documents, and notes
Exec=bash -c "cd '$APP_DIR' && npm run dev"
Icon=$ICON_PATH
Terminal=false
Type=Application
Categories=Office;Development;Utility;
Keywords=Notes;AI;Meeting;Transcript;Markdown;
StartupNotify=true
EOF

chmod +x "$DESKTOP_ENTRY"

# Also copy to ~/Desktop if folder exists
if [ -d "$HOME/Desktop" ]; then
  cp "$DESKTOP_ENTRY" "$HOME/Desktop/domonote.desktop"
  chmod +x "$HOME/Desktop/domonote.desktop"
  # Support GNOME trusted desktop file
  gio set "$HOME/Desktop/domonote.desktop" metadata::trusted true 2>/dev/null || true
fi

echo "[DomoNote] System application launcher registered: $DESKTOP_ENTRY"
echo "========================================================"
echo "  Installation Complete! Starting DomoNote..."
echo "========================================================"

npm run dev
