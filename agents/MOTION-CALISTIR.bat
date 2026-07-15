@echo off
REM MAMILAS - cift tikla. INCE KABUK: butun mantik runner.mjs, butun yasa kick/ icinde.
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
node runner.mjs
if errorlevel 1 pause
