@echo off
REM MAMILAS - cift tikla. INCE KABUK: butun mantik runner.mjs icinde.
REM Cift tik = YONETMEN (Mami mandasi): batch arkada kosar, Mami yalniz Yonetmen'le konusur.
REM Yalniz-batch isteyen "node runner.mjs --batch", sahne-sahne mod "--scene <id>" kosar.
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
node runner.mjs --director %*
if errorlevel 1 pause
