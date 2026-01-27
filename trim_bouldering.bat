@echo off
echo ================================================
echo Trimming bouldering.mp4 to under 100MB
echo ================================================
echo.

cd /d "%~dp0media"

echo Current file size:
dir bouldering.mp4 | find "bouldering.mp4"
echo.

echo Creating backup...
if not exist "original_backups" mkdir original_backups
copy bouldering.mp4 original_backups\bouldering_original.mp4 >nul
echo Backup created in media\original_backups\
echo.

echo Trimming video (keeping first 32 seconds)...
echo This may take a minute...
ffmpeg -i bouldering.mp4 -t 32 -c:v libx264 -crf 23 -c:a aac -b:a 128k -y temp_bouldering.mp4 2>nul

if exist temp_bouldering.mp4 (
    del bouldering.mp4
    ren temp_bouldering.mp4 bouldering.mp4
    echo.
    echo ================================================
    echo SUCCESS! Video trimmed to 32 seconds
    echo ================================================
    echo.
    echo New file size:
    dir bouldering.mp4 | find "bouldering.mp4"
    echo.
    echo Original backup saved in: media\original_backups\bouldering_original.mp4
) else (
    echo.
    echo ================================================
    echo ERROR: Trimming failed
    echo ================================================
    echo.
    echo Make sure you:
    echo 1. Close this terminal
    echo 2. Open a NEW terminal (so ffmpeg is in PATH)
    echo 3. Run this script again
)

echo.
echo Press any key to exit...
pause > nul
