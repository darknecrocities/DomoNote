#!/usr/bin/env bash

# DomoNote - 1-Click Chrome Extension Auto-Launcher
# Loads the DomoNote companion extension directly into Google Chrome/Chromium without manual Developer Mode steps.

set -e

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )/.." && pwd )"
EXT_DIR="$DIR/browser-extension"

echo "========================================================"
echo "  DomoNote - Automated 1-Click Chrome Extension Setup"
echo "  Loading: $EXT_DIR"
echo "========================================================"

if [ ! -d "$EXT_DIR" ]; then
  echo "[Error] browser-extension directory not found at $EXT_DIR"
  exit 1
fi

# Detect OS and launch appropriate Chrome binary
case "$(uname -s)" in
  Darwin*)
    # macOS
    if [ -d "/Applications/Google Chrome.app" ]; then
      echo "[DomoNote] Launching Google Chrome with DomoNote extension loaded..."
      open -a "Google Chrome" --args --load-extension="$EXT_DIR"
    elif [ -d "/Applications/Chromium.app" ]; then
      echo "[DomoNote] Launching Chromium with DomoNote extension loaded..."
      open -a "Chromium" --args --load-extension="$EXT_DIR"
    elif [ -d "/Applications/Brave Browser.app" ]; then
      echo "[DomoNote] Launching Brave Browser with DomoNote extension loaded..."
      open -a "Brave Browser" --args --load-extension="$EXT_DIR"
    elif [ -d "/Applications/Microsoft Edge.app" ]; then
      echo "[DomoNote] Launching Microsoft Edge with DomoNote extension loaded..."
      open -a "Microsoft Edge" --args --load-extension="$EXT_DIR"
    else
      echo "[Notice] No default Chromium app found in /Applications."
      echo "Please open your browser's extensions page (chrome://extensions) and load: $EXT_DIR"
    fi
    ;;

  Linux*)
    # Linux
    CHROME_BIN=""
    for bin in google-chrome google-chrome-stable chromium-browser chromium brave-browser microsoft-edge; do
      if command -v "$bin" >/dev/null 2>&1; then
        CHROME_BIN="$bin"
        break
      fi
    done

    if [ -n "$CHROME_BIN" ]; then
      echo "[DomoNote] Launching $CHROME_BIN with DomoNote extension loaded..."
      "$CHROME_BIN" --load-extension="$EXT_DIR" &
    else
      echo "[Notice] Chromium browser not found in PATH."
      echo "Load unpacked from: $EXT_DIR"
    fi
    ;;

  CYGWIN*|MINGW*|MSYS*)
    # Windows
    if [ -f "/c/Program Files/Google/Chrome/Application/chrome.exe" ]; then
      "/c/Program Files/Google/Chrome/Application/chrome.exe" --load-extension="$(cygpath -w "$EXT_DIR")" &
    else
      start chrome --load-extension="$EXT_DIR" 2>/dev/null || true
    fi
    ;;

  *)
    echo "Unsupported OS: $(uname -s)"
    ;;
esac

echo "[DomoNote] Extension loaded successfully! Access all features via the extension icon or Side Panel."
