@echo off
title Interlink Internship Management Portal Launcher
echo ===================================================
echo   Interlink - University Internship Management Portal
echo   Faculty of Technology, University of Ruhuna
echo ===================================================
echo.
echo Starting Backend API server on http://localhost:5000 ...
start "Interlink Backend" cmd /k "cd /d %~dp0backend && set NODE_OPTIONS=--use-system-ca && npm run dev"

echo Starting Frontend Dev Server on http://localhost:5173 ...
start "Interlink Frontend" cmd /k "cd /d %~dp0frontend && set NODE_OPTIONS=--use-system-ca && npm run dev"

echo.
echo Servers are launching in separate windows!
echo Once started, open your browser to: http://localhost:5173
echo.
pause
