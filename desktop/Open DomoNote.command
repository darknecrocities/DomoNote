#!/usr/bin/env bash

# DomoNote - 1-Click macOS Launcher & Gatekeeper Unquarantine Helper
# Resolves macOS "App is damaged and can't be opened" error on open-source apps.

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

echo "========================================================"
echo "  DomoNote macOS Launcher - Personal AI Secretary"
echo "========================================================"

TARGET_APP=""
if [ -d "/Applications/DomoNote.app" ]; then
  TARGET_APP="/Applications/DomoNote.app"
elif [ -d "$DIR/DomoNote.app" ]; then
  TARGET_APP="$DIR/DomoNote.app"
elif [ -d "$DIR/../DomoNote.app" ]; then
  TARGET_APP="$DIR/../DomoNote.app"
fi

if [ -n "$TARGET_APP" ]; then
  echo "[DomoNote] Removing macOS Gatekeeper quarantine from $TARGET_APP..."
  xattr -cr "$TARGET_APP" 2>/dev/null || sudo xattr -cr "$TARGET_APP" 2>/dev/null || true
  echo "[DomoNote] Launching DomoNote..."
  open "$TARGET_APP"
else
  echo "[Notice] DomoNote.app not found in Applications or current directory."
  echo "Please drag DomoNote.app into your /Applications folder, then re-run this helper."
fi
