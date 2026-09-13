#!/usr/bin/env bash

# DomoNote - Automated Single-Click Ollama Setup
# Strictly avoids emoji characters in all output logs.

set -e

echo "[DomoNote] Initializing automated local AI setup..."

# 1. Check if ollama binary exists
if ! command -v ollama >/dev/null 2>&1; then
  echo "[DomoNote] Ollama binary not found in PATH."
  if [[ "$OSTYPE" == "darwin"* ]]; then
    if command -v brew >/dev/null 2>&1; then
      echo "[DomoNote] Attempting to install Ollama via Homebrew..."
      brew install ollama
    else
      echo "[DomoNote] Homebrew not found. Please install Ollama manually from https://ollama.com/download"
      exit 1
    fi
  else
    echo "[DomoNote] Installing Ollama via official installer..."
    curl -fsSL https://ollama.com/install.sh | sh
  fi
fi

# 2. Check if Ollama service is already responding
OLLAMA_URL="http://localhost:11434"
IS_RUNNING=0

if curl -s -f "$OLLAMA_URL/api/tags" >/dev/null 2>&1; then
  IS_RUNNING=1
  echo "[DomoNote] Ollama service is already running on $OLLAMA_URL"
else
  echo "[DomoNote] Ollama service not running. Starting Ollama in background with CORS enabled..."
  export OLLAMA_ORIGINS="*"
  nohup ollama serve > /tmp/ollama_domonote.log 2>&1 &
  
  # Wait up to 15 seconds for Ollama to become ready
  for i in {1..15}; do
    if curl -s -f "$OLLAMA_URL/api/tags" >/dev/null 2>&1; then
      IS_RUNNING=1
      echo "[DomoNote] Ollama service successfully started."
      break
    fi
    sleep 1
  done
fi

if [ "$IS_RUNNING" -ne 1 ]; then
  echo "[DomoNote] Warning: Could not connect to Ollama service after start attempt."
  echo "[DomoNote] Please run 'ollama serve' manually in another terminal."
  exit 1
fi

# 3. Check installed models and auto-pull a default model if needed
MODELS_COUNT=$(curl -s "$OLLAMA_URL/api/tags" | grep -o '"name"' | wc -l || echo "0")

if [ "$MODELS_COUNT" -eq 0 ]; then
  DEFAULT_MODEL="llama3.2"
  echo "[DomoNote] No models currently installed. Pulling default lightweight model: $DEFAULT_MODEL..."
  ollama pull "$DEFAULT_MODEL"
  echo "[DomoNote] Model $DEFAULT_MODEL successfully pulled."
else
  echo "[DomoNote] Found $MODELS_COUNT installed model(s) ready for DomoNote."
fi

echo "[DomoNote] Local AI environment is fully configured and ready."
