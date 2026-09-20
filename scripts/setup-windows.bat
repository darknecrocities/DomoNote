@echo off
rem ========================================================
rem   DomoNote - Automated Windows Desktop Installer
rem   Capture it. Understand it. Keep it.
rem ========================================================
title DomoNote Setup - Personal AI Secretary

setlocal enabledelayedexpansion

echo ========================================================
echo   DomoNote Desktop - Windows Automated Installation
echo ========================================================
echo.

rem 1. Check Git
where git >nul 2>nul
if %ERRORLEVEL% neq 0 (
  echo [Error] Git is not installed or not in PATH.
  echo Please install Git from https://git-scm.com/download/win and rerun.
  pause
  exit /b 1
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

rem 4. Install Dependencies
echo [DomoNote] Installing Node dependencies...
call npm install --no-audit --no-fund

rem 5. Create Windows Desktop Shortcut with App Icon
set "SHORTCUT_PATH=%USERPROFILE%\Desktop\DomoNote.lnk"
set "ICON_PATH=!APP_DIR!\public\favicon.ico"
echo [DomoNote] Creating Desktop Shortcut...

powershell -ExecutionPolicy Bypass -Command "$ws = New-Object -ComObject WScript.Shell; $s = $ws.CreateShortcut('%SHORTCUT_PATH%'); $s.TargetPath = 'cmd.exe'; $s.Arguments = '/c cd /d \"!APP_DIR!\" && npm run dev'; $s.WorkingDirectory = '!APP_DIR!'; if (Test-Path '%ICON_PATH%') { $s.IconLocation = '%ICON_PATH%'; } $s.Save()"

echo [DomoNote] Shortcut created on Desktop: DomoNote
echo.
echo ========================================================
echo   Installation Complete! Launching DomoNote...
echo ========================================================
echo.

call npm run dev
