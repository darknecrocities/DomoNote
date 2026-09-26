@echo off
set "DIR=%~dp0"
echo ========================================================
echo   DomoNote Chrome Extension - Automated 1-Click Launch
echo ========================================================
start chrome --load-extension="%DIR%browser-extension" || start msedge --load-extension="%DIR%browser-extension"
echo [DomoNote] Browser launched with extension active!
