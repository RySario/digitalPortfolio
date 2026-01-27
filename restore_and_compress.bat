@echo off
echo ================================================
echo Restoring bouldering.mp4 from backup
echo Then re-compressing with correct aspect ratio
echo ================================================
echo.

cd /d "%~dp0media"

echo Restoring bouldering.mp4 from backup...
copy original_backups\bouldering.mp4 bouldering.mp4 /Y >nul
echo Restored!
echo.

echo Original size:
dir bouldering.mp4 | find "bouldering.mp4"
echo.

echo Re-compressing to 32 seconds with CORRECT aspect ratio...
echo This may take a minute...
ffmpeg -i bouldering.mp4 -t 32 -vf "scale=-2:720" -c:v libx264 -crf 28 -preset fast -c:a aac -b:a 96k -y temp_bouldering.mp4 2>nul

if exist temp_bouldering.mp4 (
    del bouldering.mp4
    ren temp_bouldering.mp4 bouldering.mp4
    echo.
    echo ================================================
    echo SUCCESS! Video compressed (32 seconds, no squish!)
    echo ================================================
    echo.
    echo New size:
    dir bouldering.mp4 | find "bouldering.mp4"
) else (
    echo.
    echo ERROR: Compression failed
    echo Make sure you opened a NEW terminal so ffmpeg is in PATH
)

echo.
echo Press any key to exit...
pause > nul
