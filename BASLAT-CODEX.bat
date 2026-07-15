@echo off
setlocal
cd /d "%~dp0"
powershell -NoLogo -NoExit -ExecutionPolicy Bypass -File "%~dp0scripts\start-codex.ps1"
