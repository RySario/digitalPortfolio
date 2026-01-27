@echo off
echo ================================================
echo Compressing ALL videos to under 25MB each
echo ================================================
echo.

cd /d "%~dp0media"

echo Creating backups...
if not exist "original_backups" mkdir original_backups
copy *.mp4 original_backups\ >nul 2>nul
echo Backups created in media\original_backups\
echo.

echo ================================================
echo Processing basketball.mp4 (25 seconds)
echo ================================================
ffmpeg -i basketball.mp4 -t 25 -vf "scale=-2:720" -c:v libx264 -crf 28 -preset fast -c:a aac -b:a 96k -y temp_basketball.mp4 2>nul
if exist temp_basketball.mp4 (
    del basketball.mp4
    ren temp_basketball.mp4 basketball.mp4
    echo SUCCESS!
    dir basketball.mp4 | find "basketball.mp4"
) else (
    echo FAILED
)
echo.

echo ================================================
echo Processing bouldering.mp4 (32 seconds)
echo ================================================
ffmpeg -i bouldering.mp4 -t 32 -vf "scale=-2:720" -c:v libx264 -crf 28 -preset fast -c:a aac -b:a 96k -y temp_bouldering.mp4 2>nul
if exist temp_bouldering.mp4 (
    del bouldering.mp4
    ren temp_bouldering.mp4 bouldering.mp4
    echo SUCCESS!
    dir bouldering.mp4 | find "bouldering.mp4"
) else (
    echo FAILED
)
echo.

echo ================================================
echo Processing racing.mp4 (25 seconds)
echo ================================================
ffmpeg -i racing.mp4 -t 25 -vf "scale=-2:720" -c:v libx264 -crf 28 -preset fast -c:a aac -b:a 96k -y temp_racing.mp4 2>nul
if exist temp_racing.mp4 (
    del racing.mp4
    ren temp_racing.mp4 racing.mp4
    echo SUCCESS!
    dir racing.mp4 | find "racing.mp4"
) else (
    echo FAILED
)
echo.

echo ================================================
echo DONE! All videos compressed
echo ================================================
echo.
echo Total media folder size:
dir *.mp4 *.jpg *.JPG
echo.
echo Original backups saved in: media\original_backups\
echo.
echo Press any key to exit...
pause > nul
