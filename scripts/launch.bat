@echo off
title CODEtoFIGMA Application Launcher
cls

echo ===================================================
echo             CODEtoFIGMA Launcher
echo  Convert Live Vue UI to OpenPencil & Write Back Code
echo ===================================================
echo.
echo Select an option:
echo [1] Start Vue UI Application (http://127.0.0.1:4174)
echo [2] Run UI Capture Pipeline (Generate original.fig)
echo [3] Run Visual Writeback (Apply working.fig edits)
echo [4] Run Full Repository Quality Gate (pnpm check)
echo [5] Exit
echo.

set /p choice="Enter option [1-5]: "

if "%choice%"=="1" goto DEV_SERVER
if "%choice%"=="2" goto CAPTURE
if "%choice%"=="3" goto WRITEBACK
if "%choice%"=="4" goto CHECK
if "%choice%"=="5" goto END

:DEV_SERVER
echo.
echo Starting Vue UI application on http://127.0.0.1:4174 ...
cd /d "%~dp0.."
start http://127.0.0.1:4174
call pnpm dev:vue
pause
goto END

:CAPTURE
echo.
echo Running UI Capture & Canvas Preview Pipeline ...
cd /d "%~dp0.."
call pnpm milestone1
echo.
echo Capture complete! Output saved to original.fig and design-preview.png.
pause
goto END

:WRITEBACK
echo.
echo Running Visual Writeback Sync ...
cd /d "%~dp0.."
call pnpm writeback
echo.
echo Writeback completed!
pause
goto END

:CHECK
echo.
echo Running full repository quality gate checks ...
cd /d "%~dp0.."
call pnpm check
pause
goto END

:END
exit /b 0
