@echo off
echo Stopping AniTrack...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":3001 " 2^>nul') do taskkill /PID %%a /F >nul 2>&1
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":5173 " 2^>nul') do taskkill /PID %%a /F >nul 2>&1
taskkill /FI "WINDOWTITLE eq AniTrack-Backend" /T /F >nul 2>&1
taskkill /FI "WINDOWTITLE eq AniTrack-Frontend" /T /F >nul 2>&1
echo [OK] App band ho gayi!
pause
