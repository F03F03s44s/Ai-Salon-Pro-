@echo off
title Urban Nail Bar - Sync MacOS + Windows folders
cd /d "%~dp0.."
set "WIN=%CD%"
set "MAC=%CD%\..\Urban Nail Bar (MacOS)"

echo ============================================
echo   Urban Nail Bar - SYNC BOTH FOLDERS
echo ============================================
echo.
echo   Windows: %WIN%
echo   MacOS:   %MAC%
echo.

if not exist "%MAC%\package.json" (
    echo ERROR: MacOS folder not found next to this Windows folder.
    echo Expected: %MAC%
    pause
    exit /b 1
)

echo Choose sync direction:
echo   [1] Windows  -^>  MacOS   ^(this PC is source of truth^)
echo   [2] MacOS    -^>  Windows ^(Mac copy is source of truth^)
echo   [3] Bidirectional newer-wins ^(careful — for code/assets only^)
echo   [4] Cancel
choice /c 1234 /n /m "Select 1-4: "
if errorlevel 4 goto :eof
if errorlevel 3 goto BIDI
if errorlevel 2 goto MAC_TO_WIN
if errorlevel 1 goto WIN_TO_MAC

:WIN_TO_MAC
echo.
echo Syncing Windows -^> MacOS ...
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0SYNC-FOLDERS.ps1" -Source "%WIN%" -Dest "%MAC%"
goto DONE

:MAC_TO_WIN
echo.
echo Syncing MacOS -^> Windows ...
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0SYNC-FOLDERS.ps1" -Source "%MAC%" -Dest "%WIN%"
goto DONE

:BIDI
echo.
echo Bidirectional newer-wins sync ...
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0SYNC-FOLDERS.ps1" -Source "%WIN%" -Dest "%MAC%" -Bidirectional
goto DONE

:DONE
echo.
echo Sync finished. Run VALIDATE.bat on both sides if you changed code.
pause
