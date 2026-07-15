@echo off
chcp 65001 >nul
cd /d "%~dp0"
title MAMILAS - Studio Console

echo.
echo   MAMILAS Studio Console
echo   ----------------------
echo.

where node >nul 2>nul
if errorlevel 1 (
  echo   [X] Node.js bulunamadi.
  echo       Kur: https://nodejs.org  ^(LTS^)
  echo.
  pause
  exit /b 1
)

if not exist "node_modules\" (
  echo   Ilk calistirma - kutuphaneler kuruluyor.
  echo   Bu birkac dakika surer, bekle.
  echo.
  call npm install
  if errorlevel 1 (
    echo.
    echo   [X] Kurulum basarisiz. Cikti yukarida.
    pause
    exit /b 1
  )
  echo.
)

echo   Site aciliyor... tarayici birazdan gelecek.
echo   Kapatmak icin: bu pencerede Ctrl+C
echo.

start "" http://localhost:5173
call npm run dev

echo.
echo   Sunucu durdu.
pause
