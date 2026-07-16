@echo off
REM MAMILAS - cift tikla. INCE KABUK: butun mantik runner.mjs icinde.
REM Cift tik = BATCH (Mami mandasi): tum sahneler tek kosuda, frame kapisina kadar.
REM Sahne-sahne titiz mod isteyen terminalden "node runner.mjs --scene <id>" kosar.
chcp 65001 >nul 2>nul
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo.
  echo [HATA] node bulunamadi. Kur: https://nodejs.org
  echo.
  pause
  exit /b 1
)
node runner.mjs --batch %*
if errorlevel 1 pause
