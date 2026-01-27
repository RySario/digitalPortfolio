@echo off
echo ================================================
echo Trimming MP3 files to 20 seconds
echo ================================================
echo.

cd /d "%~dp0music"

for %%f in (*.mp3) do (
    echo Processing: %%f
    ffmpeg -i "%%f" -t 20 -acodec libmp3lame -b:a 192k -y "temp_%%f" 2>nul
    if exist "temp_%%f" (
        del "%%f"
        ren "temp_%%f" "%%f"
        echo   ^> Successfully trimmed to 20 seconds
    ) else (
        echo   ^> ERROR: Failed to trim
    )
    echo.
)

echo.
echo ================================================
echo Done! All files have been trimmed to 20 seconds.
echo ================================================
echo.

dir *.mp3

echo.
echo Press any key to exit...
pause > nul
