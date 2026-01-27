@echo off
echo ================================================
echo Fixing Git Large File Issues
echo ================================================
echo.
echo This will:
echo 1. Remove large video files from Git history
echo 2. Add them fresh (after compression)
echo.
echo WARNING: This rewrites Git history!
echo Make sure you've backed up your work first.
echo.
pause

cd /d "%~dp0"

echo.
echo Removing videos from Git cache...
git rm --cached media/*.mp4 2>nul
git rm --cached media/original_backups/*.mp4 2>nul

echo.
echo Adding .gitignore for backup folders...
echo media/original_backups/ >> .gitignore
echo music/original_backups/ >> .gitignore

echo.
echo Committing removal...
git add .gitignore
git commit -m "Remove large video files from Git tracking"

echo.
echo Now add the compressed videos back...
git add media/*.mp4
git commit -m "Add compressed video files (under 25MB each)"

echo.
echo ================================================
echo Done! Your Git repo is now clean.
echo ================================================
echo.
echo Next steps:
echo 1. Try: git push
echo 2. If it still fails, you may need to force push: git push --force
echo    (Only do this if you're sure no one else is working on the repo!)
echo.
pause
