@echo off
title AniTrack - Starting...
color 0A
cls

echo.
echo  ============================================
echo   AniTrack - Anime and TV Tracker
echo  ============================================
echo.

set "ROOT=%~dp0"
set "BACKEND=%ROOT%backend"
set "FRONTEND=%ROOT%frontend"

:: Check extracted properly
if not exist "%BACKEND%\server.js" (
    color 0C
    echo  [ERROR] Files nahi mili!
    echo  ZIP pe Right-click - Extract All - phir chalao
    pause
    exit /b 1
)

:: Find Node.js in common install locations
set "NODE_EXE="
set "NPM_EXE="

if exist "C:\Program Files\nodejs\node.exe" (
    set "NODE_EXE=C:\Program Files\nodejs\node.exe"
    set "NPM_EXE=C:\Program Files\nodejs\npm.cmd"
    goto FOUND_NODE
)
if exist "C:\Program Files (x86)\nodejs\node.exe" (
    set "NODE_EXE=C:\Program Files (x86)\nodejs\node.exe"
    set "NPM_EXE=C:\Program Files (x86)\nodejs\npm.cmd"
    goto FOUND_NODE
)
if exist "%APPDATA%\nvm\current\node.exe" (
    set "NODE_EXE=%APPDATA%\nvm\current\node.exe"
    set "NPM_EXE=%APPDATA%\nvm\current\npm.cmd"
    goto FOUND_NODE
)
if exist "%LOCALAPPDATA%\Programs\nodejs\node.exe" (
    set "NODE_EXE=%LOCALAPPDATA%\Programs\nodejs\node.exe"
    set "NPM_EXE=%LOCALAPPDATA%\Programs\nodejs\npm.cmd"
    goto FOUND_NODE
)

:: Try PATH
where node >nul 2>&1
if %errorlevel% equ 0 (
    set "NODE_EXE=node"
    set "NPM_EXE=npm"
    goto FOUND_NODE
)

color 0C
echo  [ERROR] Node.js nahi mila!
echo.
echo  Please manually check:
echo  1. https://nodejs.org se LTS download karo
echo  2. Install karo
echo  3. Computer RESTART karo
echo  4. Phir START_APP.bat chalao
pause
exit /b 1

:FOUND_NODE
echo  [OK] Node.js found!

:: Add nodejs to PATH for this session
set "PATH=C:\Program Files\nodejs;%APPDATA%\npm;%PATH%"

:: Kill old processes
echo  [INFO] Old servers band kar raha hai...
for /f "tokens=5" %%a in ('netstat -aon 2^>nul ^| findstr ":3001 "') do (
    taskkill /PID %%a /F >nul 2>&1
)
timeout /t 2 /nobreak >nul

:: Install backend
if not exist "%BACKEND%\node_modules\express" (
    echo  [INSTALL] Backend packages install ho rahe hain... (1-2 min)
    cd /d "%BACKEND%"
    call "%NPM_EXE%" install
    if %errorlevel% neq 0 (
        color 0C
        echo  [ERROR] Backend install failed! Internet check karo.
        pause
        exit /b 1
    )
    echo  [OK] Backend installed!
) else (
    echo  [OK] Backend ready!
)

:: Install frontend
if not exist "%FRONTEND%\node_modules\vite" (
    echo  [INSTALL] Frontend packages install ho rahe hain... (2-3 min)
    cd /d "%FRONTEND%"
    call "%NPM_EXE%" install
    if %errorlevel% neq 0 (
        color 0C
        echo  [ERROR] Frontend install failed!
        pause
        exit /b 1
    )
    echo  [OK] Frontend installed!
) else (
    echo  [OK] Frontend ready!
)

:: Build frontend
echo.
echo  [BUILD] Frontend build ho raha hai... (1-2 min)
cd /d "%FRONTEND%"
call "%NPM_EXE%" run build
if %errorlevel% neq 0 (
    color 0C
    echo  [ERROR] Build failed!
    pause
    exit /b 1
)
echo  [OK] Frontend build complete!

:: Init DB
if not exist "%BACKEND%\data\anitrack.db" (
    echo  [DB] Database bana raha hai...
    cd /d "%BACKEND%"
    "%NODE_EXE%" scripts\init-db.js
    echo  [OK] Database ready!
) else (
    echo  [OK] Database exists!
)

:: Start server
echo.
echo  [START] Server start ho raha hai...
cd /d "%BACKEND%"
start "AniTrack-Server" cmd /k "color 0A && echo DO NOT CLOSE THIS WINDOW && echo. && "%NODE_EXE%" server.js"

:: Wait for server
echo  [WAIT] Server ready ho raha hai...
set count=0
:WAITLOOP
set /a count+=1
timeout /t 2 /nobreak >nul
netstat -aon 2>nul | findstr ":3001 " | findstr "LISTENING" >nul 2>&1
if %errorlevel% equ 0 goto READY
if %count% lss 15 goto WAITLOOP

:READY
start "" http://localhost:3001

cls
echo.
echo  ============================================
echo   APP CHAL RAHA HAI!
echo  ============================================
echo.
echo   Browser: http://localhost:3001
echo.
echo   LOGIN:
echo   Email   : demo@anitrack.com
echo   Password: demo123
echo.
echo   AniTrack-Server window band mat karna!
echo  ============================================
echo.
pause
