@echo off
rem ========================================================
rem   DomoNote - Automated Windows Desktop Installer
rem   Capture it. Understand it. Keep it.
rem ========================================================
title DomoNote Setup - Personal AI Secretary

setlocal enabledelayedexpansion

echo ========================================================
echo   DomoNote Desktop - Windows Automated Installation
echo   Capture it. Understand it. Keep it.
echo ========================================================
echo.

rem 1. Check Git
where git >nul 2>nul
if %ERRORLEVEL% neq 0 (
  echo [Notice] Git is not detected in PATH.
  echo If you want to contribute to the source, install Git from https://git-scm.com/
)

rem 2. Check Node.js
where node >nul 2>nul
if %ERRORLEVEL% neq 0 (
  echo [Error] Node.js is not installed or not in PATH.
  echo Please install Node.js (LTS version) from https://nodejs.org/ and rerun.
  pause
  exit /b 1
)

rem 3. Determine Installation Directory
if exist "package.json" (
  set "APP_DIR=%CD%"
) else (
  set "APP_DIR=%USERPROFILE%\.domonote"
  if not exist "!APP_DIR!" (
    echo [DomoNote] Cloning DomoNote repository to !APP_DIR!...
    git clone https://github.com/darknecrocities/DomoNote.git "!APP_DIR!"
  ) else (
    echo [DomoNote] Updating existing DomoNote in !APP_DIR!...
    cd /d "!APP_DIR!"
    git pull
  )
)

cd /d "!APP_DIR!"

rem 4. Configure Local AI (Ollama)
echo [DomoNote] Checking local Ollama AI service...
where ollama >nul 2>nul
if %ERRORLEVEL% equ 0 (
  powershell -ExecutionPolicy Bypass -Command "try { $r = Invoke-WebRequest -Uri 'http://localhost:11434/api/tags' -TimeoutSec 2 -UseBasicParsing; exit 0 } catch { exit 1 }" >nul 2>nul
  if !ERRORLEVEL! equ 0 (
    echo [DomoNote] Ollama AI service is already running on http://localhost:11434
  ) else (
    echo [DomoNote] Starting Ollama service with CORS enabled (OLLAMA_ORIGINS="*")...
    set OLLAMA_ORIGINS=*
    start /b "" ollama serve >nul 2>&1
    timeout /t 3 /nobreak >nul
  )
) else (
  echo [DomoNote] Ollama is not installed. DomoNote will run in browser-first mode.
  echo [DomoNote] To enable local offline AI models, install Ollama from https://ollama.com/download/windows
)

rem 5. Install Dependencies
echo.
echo [DomoNote] Verifying Node dependencies...
if not exist "node_modules" (
  call npm install --no-audit --no-fund
)

rem 6. Create Windows Desktop and Start Menu Shortcuts with App Icon
set "SHORTCUT_PATH=%USERPROFILE%\Desktop\DomoNote.lnk"
set "START_MENU_PATH=%APPDATA%\Microsoft\Windows\Start Menu\Programs\DomoNote.lnk"
set "ICON_PATH=!APP_DIR!\public\favicon.ico"
echo [DomoNote] Creating Desktop Shortcut...

powershell -ExecutionPolicy Bypass -Command "$ws = New-Object -ComObject WScript.Shell; $s = $ws.CreateShortcut('%SHORTCUT_PATH%'); $s.TargetPath = 'cmd.exe'; $s.Arguments = '/c cd /d \"!APP_DIR!\" && npm run dev'; $s.WorkingDirectory = '!APP_DIR!'; if (Test-Path '%ICON_PATH%') { $s.IconLocation = '%ICON_PATH%'; } $s.Save(); $s2 = $ws.CreateShortcut('%START_MENU_PATH%'); $s2.TargetPath = 'cmd.exe'; $s2.Arguments = '/c cd /d \"!APP_DIR!\" && npm run dev'; $s2.WorkingDirectory = '!APP_DIR!'; if (Test-Path '%ICON_PATH%') { $s2.IconLocation = '%ICON_PATH%'; } $s2.Save();"

echo [DomoNote] Shortcut created on Desktop: DomoNote.lnk
echo [DomoNote] Shortcut created in Start Menu: DomoNote.lnk
echo.
echo ========================================================
echo   Installation Complete! Launching DomoNote...
echo ========================================================
echo.

call npm run dev
