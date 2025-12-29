@echo off
echo ========================================
echo   TikTok Auction Board - Quick Start
echo ========================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js n'est pas installe!
    echo.
    echo Telechargez Node.js depuis: https://nodejs.org/
    echo.
    pause
    exit /b 1
)

echo [OK] Node.js detecte: 
node --version
echo.

REM Navigate to server directory
cd /d "%~dp0server"

REM Check if node_modules exists
if not exist "node_modules\" (
    echo [INFO] Installation des dependances...
    echo.
    call npm install
    echo.
    if %ERRORLEVEL% NEQ 0 (
        echo [ERROR] Echec de l'installation!
        pause
        exit /b 1
    )
    echo [OK] Dependances installees!
    echo.
)

REM Start server
echo ========================================
echo   Demarrage du serveur...
echo ========================================
echo.
echo [INFO] Le serveur va demarrer sur ws://localhost:8080
echo [INFO] Gardez cette fenetre ouverte!
echo.
echo Instructions:
echo 1. Ouvrez index.html dans votre navigateur
echo 2. Entrez un @username TikTok en live
echo 3. Cliquez sur "Se connecter"
echo.
echo Appuyez sur CTRL+C pour arreter le serveur
echo.
echo ========================================
echo.

call npm start
